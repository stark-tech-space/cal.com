import express, { Request, Response } from 'express';
import prisma from "@calcom/prisma";
import { initDoctorCalSchedule } from "../utils/index"
import { convertSchedule } from "../utils/schedule"
import { Availability } from '../types/doctor'
import { WeekDay } from '../types/common';
import useSecret from '../../middleware/useSecret'
import { deleteDoctorCalEventype } from "../utils/index"
import { firestore } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import add from 'date-fns/add'
import parseISO from 'date-fns/parseISO'
import { AccountWithId } from '../types/account';
import { CreateAppointmentRequest } from '../types/appointment'
import isValid from 'date-fns/isValid';
import isAfter from 'date-fns/isAfter';
import { createTreatmentAppointment } from '../utils/appointment'

const indexRouter = express.Router();
const router = express.Router();

enum ErrorCode {
  INVALID_TIME = 'INVALID_TIME',
  NO_OPD_TIME = 'NO_OPD_TIME',
  FIELD_ERROR = 'FIELD_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}


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

router.post(`/bookings`, async (req: Request, res: Response) => {

  // create booking

  const data = req.body
  const { doctorId, accountId } = res.locals

  const user = await prisma.user.findFirst({
    where: {
      metadata: {
        path: ['doctorId'],
        equals: doctorId
      }
    }, rejectOnNotFound: true
  })

  // create firestore appointment
  // const appointmentDocRef = firestore.collection(`accounts/${accountId}/appointments`).doc();

  // await appointmentDocRef.set(data);

  const account = { id: accountId }
  const { patientId, start, treatment, fields, basicFields, note } =
    req.body as CreateAppointmentRequest;
  const startISODate = parseISO(start);

  console.log('==========isValid(startISODate)', isValid(startISODate))

  if (!isValid(startISODate) || isAfter(new Date(), startISODate)) {
    res.status(400).json({ code: ErrorCode.INVALID_TIME });
    return;
  }

  let appointmentId = '';
  appointmentId = await createTreatmentAppointment({
    account,
    doctorId,
    patientId,
    treatment,
    startISODate,
    basicFields,
    fields,
    note,
  });


  // need to check time zone
  const booking = await prisma.booking.create({
    data: {
      eventTypeId: Number(data.eventTypeId),
      title: data.treatment.name,
      startTime: data.start,
      endTime: add(parseISO(data.start), {
        minutes: data.treatment.duration,
      }),
      userId: user.id,
      uid: uuidv4(),
      customInputs: {
        appointment: appointmentId,
        patientId: data.patientId,
        accountId: data.accountId
      }
    }
  });

  res.json({ booking, appointment: appointmentId })

})

router.get(`/schedule`, async (req: Request, res: Response) => {

  const { eventTypeId, start, end, duration, bookingStartMinsModulus } = req.query;

  const schedule = await prisma.eventType.findUnique({ where: { id: Number(eventTypeId) } }).schedule().availability()

  const result = await convertSchedule(
    start,
    end,
    Number(duration),
    Number(bookingStartMinsModulus),
    schedule)

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
