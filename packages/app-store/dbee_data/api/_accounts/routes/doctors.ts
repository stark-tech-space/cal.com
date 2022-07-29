import express, { Request, Response } from 'express';
import prisma from "@calcom/prisma";
import { initDoctorCalSchedule } from "../utils/index"
import { Availability } from '../types/doctor'
import { WeekDay } from '../types/common';
import useSecret from '../../middleware/useSecret'
import useApiKey from '../../middleware/useApiKey'

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

  res.send('/:accountId/doctors')
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
        
      }, rejectOnNotFound: true,
      select: { eventTypes: true },
    })

  res.json(eventTypes)
})

//TODO: needs a name string
router.put('/schedule', useSecret, useApiKey, async (req: Request, res: Response) => {
  const data: Record<WeekDay, Array<Availability>> = req.body;

  const { userId } = req.query

  const { accountId, doctorId } = res.locals

  await initDoctorCalSchedule(data, userId, accountId, doctorId)

  res.status(200).json({ success: true })
})

router.post(`/bookings`, (req: Request, res: Response) => {
  res.send('booking create')
})

router.get(`/schedule`, async (req: Request, res: Response) => {

  const { eventTypeId } = req.query;

  const schedule = await prisma.eventType.findUnique({ where: { id: Number(eventTypeId) } }).schedule().availability()

  res.json(schedule)
})

export default indexRouter;
