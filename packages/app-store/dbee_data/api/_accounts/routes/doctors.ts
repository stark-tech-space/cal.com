import express, { Request, Response } from 'express';
import prisma from "@calcom/prisma";
import { initDoctorCalSchedule } from "../utils/index"
import { convertSchedule } from "../utils/schedule"
import { Availability } from '../types/doctor'
import { WeekDay } from '../types/common';
import useSecret from '../../middleware/useSecret'
import { deleteDoctorCalEventype } from "../utils/index"

const indexRouter = express.Router();
const router = express.Router();

indexRouter.get(`/`, async (req: Request, res: Response) => {

  const { accountId } = res.locals

  const users = await prisma.user.findMany({
    where: {
      metadata: {
        path: ['accountId'],
        equals: accountId
      }
    }
  })

  res.json(users)
})

indexRouter.use('/:doctorId', router);

router.get(`/treatments`, async (req: Request, res: Response) => {

  const { accountId, doctorId } = res.locals

  const eventTypes = await prisma.user
    .findFirst({
      where: {
        AND: [
          {
            metadata: {
              path: ['accountId'],
              equals: accountId
            }
          },
          {
            metadata: {
              path: ['doctorId'],
              equals: doctorId
            }
          }
        ]

      }, rejectOnNotFound: false,
      select: { eventTypes: true },
    })

  res.json(eventTypes == null ? [] : eventTypes);
})

//TODO: needs a name string
router.put('/schedule', useSecret, async (req: Request, res: Response) => {
  const data: Record<WeekDay, Array<Availability>> = req.body.weekly;

  const { accountId, doctorId } = res.locals

  const user = await prisma.user.findFirst({
    where: {
      metadata: {
        path: ['doctorId'],
        equals: doctorId
      }
    }, rejectOnNotFound: true
  })

  await initDoctorCalSchedule(data, user.id, accountId, doctorId)

  res.status(200).json({ success: true })
})

router.post(`/bookings`, (req: Request, res: Response) => {
  res.send('booking create')
})

router.get(`/schedule`, async (req: Request, res: Response) => {

  console.log('===============')

  const { eventTypeId, start, end, duration, bookingStartMinsModulus } = req.query;

  const schedule = await prisma.eventType.findUnique({ where: { id: Number(eventTypeId) } }).schedule().availability()

  const result = await convertSchedule(
    start,
    end,
    Number(duration),
    Number(bookingStartMinsModulus),
    schedule)

    console.log(result)

  res.json(result)
})

/**
 * delete user
 */
router.delete('/user', async (req: Request, res: Response) => {

  const { doctorId } = res.locals

  const user = await prisma.user.findFirst({
    where: {
      metadata: {
        path: ['doctorId'],
        equals: doctorId
      }
    }
  })

  if (!user) res.status(404).json({ message: "User not found" });

  const { eventTypes } = await prisma.user
    .findUnique({
      where: { id: user?.id },
      rejectOnNotFound: true,
      select: { eventTypes: true },
    })

  deleteDoctorCalEventype(eventTypes, user?.id, true)

  await prisma.user.delete({ where: { id: user?.id } });

  res.json({ success: 1 })
})

export default indexRouter;
