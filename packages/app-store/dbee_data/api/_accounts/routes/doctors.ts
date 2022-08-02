import express, { Request, Response } from 'express';
import prisma from "@calcom/prisma";
import { initDoctorCalSchedule, generateSeatNumber } from "../utils/index"
import { convertSchedule } from "../utils/schedule"
import { Availability } from '../types/doctor'
import { WeekDay } from '../types/common';
import useSecret from '../../middleware/useSecret'
import { deleteDoctorCalEventype } from "../utils/index"
import { v4 as uuidv4 } from "uuid";
import { CreateAppointmentRequest } from '../types/appointment'
import { createTreatmentAppointment } from '../utils/appointment'
import { BookingPayload, triggerEventTypes, calBookingStatus } from '../types/booking'
import getAppointment from '../services/firestore/appointment';
import { parseISO, add, isValid, isAfter } from 'date-fns';
import { PatientField } from '../types/patient';
import { firestore } from '../firebase';

const indexRouter = express.Router();
const router = express.Router();
enum ErrorCode {
  INVALID_TIME = 'INVALID_TIME',
  NO_OPD_TIME = 'NO_OPD_TIME',
  FIELD_ERROR = 'FIELD_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

type Event = {
  calId: number; // eventTypeId on Cal
  calDoctorId: number; // userId on Cal
  doctorId: string;
  doctorName: string;
  treatmentId: string;
  treatmentName: string; // event title. what shows up on Cal appointment
  duration: number;
  formId: string;
  isPublic: boolean;
  maxSeats: number;
};
type Field = {
  id: string; // field uniq id,
  name: string; // field name
  isRequired: true; // is field required
};

enum AvailabilityType {
  OPD = 'OPD', // 門診
  TREATMENT = 'TREATMENT', // 療程
}

export type FilledFormField = Field & { value: string | boolean };

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
  const account = { id: accountId }
  const { patientId, start, treatment, fields, basicFields, note } =
    req.body as CreateAppointmentRequest;
  const startISODate = parseISO(start);

  if (!isValid(startISODate) || isAfter(new Date(), startISODate)) {
    res.status(400).json({ code: ErrorCode.INVALID_TIME });
    return;
  }

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
      uid: uuidv4()
    }
  });

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
    bookingId: Number(booking.id)
  });

  await prisma.booking.update({
    where: {
      id: booking.id
    },
    data: {
      customInputs: {
        appointment: appointmentId,
        patientId: data.patientId,
        accountId: data.accountId
      }
    }
  })

  res.json({ booking, appointment: appointmentId })

})

router.get(`/schedule`, async (req: Request, res: Response) => {

  const { eventTypeId, start, end, duration} = req.query;
  const { doctorId, accountId } = res.locals

  const schedule = await prisma.eventType.findUnique({ where: { id: Number(eventTypeId) } }).schedule().availability()

  const user = await prisma.user.findFirst({
    where: {
      metadata: {
        path: ['doctorId'],
        equals: doctorId
      }
    }, rejectOnNotFound: true
  })


  const result = await convertSchedule(
    start,
    end,
    Number(duration),
    Number(user.bufferTime),
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

// creat booking webhook
router.post('/bookingsHook', async (req: Request, res: Response) => {

  const { triggerEvent, createdAt, payload } = req.body as BookingPayload;
  const { doctorId, accountId } = res.locals
  // if (triggerEvent !== triggerEventTypes.CREATED) return res.status(400).json({ message: "triggerEvent not vaild" });

  switch (triggerEvent) {
    case triggerEventTypes.CREATED:
      //TODO: create appointment in firestore (if made from cal so does not exist and eventType has dbee data)
      {
        const account = { id: accountId }

        const basicFields: Array<{ id: PatientField; value: string }> = [
          // { "id": PatientField.PHONE, "value": "+886987897654" }
          { "id": PatientField.NAME, "value": payload.attendees[0].name },
          // { "id": "gender", "value": "MALE" },
          // { "id": "birthday", "value": "" },
          // { "id": "idNumber", "value": "" },
          { "id": PatientField.EMAIL, "value": payload.attendees[0].email },
          // { "id": "address", "value": "" }
        ]

        const eventType = await prisma.eventType
          .findFirst({
            where: {
              id: payload.eventTypeId
            }
          })
        const metadata: any = eventType?.metadata

        if (!metadata.treatmentId) {
          return res.status(400).json({ message: "No need to synchronize data" });
        }

        let appointmentId = '';
        appointmentId = await createTreatmentAppointment({
          account,
          doctorId,
          patientId: '',
          treatment: {
            id: metadata.treatmentId,
            name: metadata.treatmentName,
            duration: Number(eventType?.length)
          },
          startISODate: parseISO(payload.startTime),
          basicFields,
          fields: [],
          note: "",
          bookingId: Number(payload.bookingId)
        });

        res.json({ appointmentId })
      }
      break;
    case triggerEventTypes.CANCELLED:
      // change status to cancelled
      const { bookingId } = payload

      const booking: any = await prisma.booking.findFirst({ where: { id: Number(bookingId) } })

      const appointmentId = booking?.customInputs?.appointment

      const appointment = await getAppointment(accountId, appointmentId);

      if (!appointment) {
        console.log(`can't find doc with id: ${appointmentId} in account: ${accountId}`);
        return res.sendStatus(200);
      }

      await firestore.doc(`accounts/${accountId}/appointments/${appointmentId}`).update({
        status: calBookingStatus.CANCELLED,
      });

      res.json({ appointmentId })
      break;
    case triggerEventTypes.RESCHEDULED:
      // TODO: change scheduled dates in firestore and create new appointment with rescheduledUid and update status of old appointment
      break;
    default:
      break;
  }
});


export default indexRouter;
