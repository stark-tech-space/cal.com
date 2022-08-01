import { WeekDay, weekDayList } from '../types/common';
import { Availability, Treatment } from '../types/doctor';
import { CalScheduleCreateRequest, CalAvailabilityCreateRequest } from '../types/cal/schedule'
import prisma from "@calcom/prisma";
import { EventType } from "@calcom/prisma/client";
import startOfDay from 'date-fns/startOfDay';
import add from 'date-fns/add'
import groupBy from 'lodash/fp/groupBy'

const TIMEZONE = 'Asia/Taipei'

// Split availabilities into availability in cal and schedule
export function transformAvailabilitiesToCal(availabilities: Record<WeekDay, Array<Availability>>, userId: any, treatmentList: any) {
  
  /* 
    1. create the user in cal and save the returned apikey
    2. convert the current schedule to a combination of eventype, schedule
    3. save all schedules
  */

  let schedules: Array<CalScheduleCreateRequest> = []

  let allAvailabilities: Array<CalAvailabilityCreateRequest> = []

  Object.entries(availabilities).map(([week, availabilities]) => {
    if (weekDayList.includes(week as WeekDay)) {
      let days: Array<number> = []

      switch (week) {
        case 'Monday': days.push(1); break;
        case 'Tuesday': days.push(2); break;
        case 'Wednesday': days.push(3); break;
        case 'Thursday': days.push(4); break;
        case 'Friday': days.push(5); break;
        case 'Saturday': days.push(6); break;
        case 'Sunday': days.push(0); break;
      }
      availabilities.map((availability, key) => {
        let start = add(startOfDay(new Date()), {
          minutes: availability.start
        })
        let end = add(startOfDay(new Date()), {
          minutes: availability.end
        })
        availability.treatments.map((treatment) => {
          let eventType = treatmentList.find((v: any) => { return v.uniqueString == treatment.uniqueString })
          
          allAvailabilities.push({
            startTime: start,
            endTime: end,
            days,
            eventTypeId: eventType.eventTypeId
          } as CalAvailabilityCreateRequest)

        })
      })
    }
  })

  const resGroup = groupBy((item: CalAvailabilityCreateRequest) => item.eventTypeId)(allAvailabilities)

  Object.entries(resGroup).map(([key, availability]) => {
    schedules.push({
      userId,
      name: `schedule_${userId}_${key}`,
      timeZone: TIMEZONE,
      availability: { create: availability },
      eventType: {
        connect: [{
          id: Number(key)
        }]
      }
    })
  })


  return schedules
}

export async function updateDoctorCalEventype(availabilities: Record<WeekDay, Array<Availability>>, userId: any, doctorId: string) {

  /* 
    1. extract all eventypes and group
    2. query all the eventypes of the user
    3. compare, if there is in the database, but the reference is not needed, then we need to delete, eventype delete need to delete all the related schedule and availability
    4. if there are parameters in the database, but not in the database, then you need to create
    5. if there are both sides to save the assignment can be
  */
  let allTreatments: Array<Treatment> = []
  Object.entries(availabilities).map(([week, availabilities]) => {
    availabilities.map((availability) => {
      availability.treatments.map((treatment) => {
        treatment['uniqueString'] = treatment.id + '_' + treatment.duration
        allTreatments.push(treatment)
      })
    })
  })
  const treatmentGroup = groupBy((item: Treatment) => item.uniqueString)(allTreatments)

  const data = await prisma.user
    .findUnique({
      where: { id: userId },
      rejectOnNotFound: true,
      select: { eventTypes: true },
    })

  const allEventype = data.eventTypes

  let result: any = []
  await Promise.all(Object.entries(treatmentGroup).map(async ([uniqueString, treatment]) => {
    let eventType: any = allEventype.find((v: any) => {
      if (v.metadata.uniqueString == uniqueString) {
        v.exist = true
        return true
      }
      return false
    })

    if (!eventType) {
      // There is no eventype, you need to create it and bind the eventypeId after creating it
      let name = `${treatment[0].name}_${treatment[0].duration}_${doctorId}`

      eventType = await prisma.eventType.create({
        data: {
          userId,
          title: `${treatment[0].name}(${treatment[0].duration}分钟)`,
          eventName: treatment[0].name,
          length: treatment[0].duration,
          slug: name,
          metadata: {
            treatmentId: treatment[0].id,
            uniqueString: treatment[0].uniqueString
          },
          users: {
            connect: [{
              id: Number(userId)
            }]
          }
        }
      });
    }

    // Bind eventypeId
    if (eventType) {
      treatment[0].eventTypeId = eventType.id
      result.push(treatment[0])
      console.log('===treatment', treatment[0])
    }
  }))

  let needDeleteEventype = allEventype.filter((v: any) => !v.exist)

  await deleteDoctorCalEventype(needDeleteEventype, userId, true)

  return result
}

export async function deleteDoctorCalEventype(eventypes: Array<EventType>, userId: any, deleteAll?: boolean) {

  const task: any = [];

  Promise.all(eventypes.map(async (eventype) => {
    task.push(prisma.eventType.delete({ where: { id: eventype.id } }))
  }))

  if (deleteAll) {

    // delete schedule
    const data = await prisma.schedule.findMany({ where: { userId } });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Look for user to check if schedule is user's default
    if (user) {
      // unset default
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          defaultScheduleId: undefined,
        },
      });

    }

    data.map(async (schedule) => {
      task.push(prisma.schedule.delete({ where: { id: schedule.id } }));
    })

    // delete availabilities
    const availabilities = await prisma.availability.findMany({ where: { userId } });
    availabilities.forEach((availability) => {
      task.push(prisma.availability.delete({ where: { id: availability.id } }));
    });

    await Promise.all(task);
  }

}

export async function initDoctorCalSchedule(availabilities: Record<WeekDay, Array<Availability>>, userId: any, accountId: string, doctorId: string) {
  try {
    // Update eventype before creating the user's schedule
    const treatmentList = await updateDoctorCalEventype(availabilities, userId, doctorId)

    // Convert availabilities to schedule in cal
    const calSchedules = transformAvailabilitiesToCal(availabilities, userId, treatmentList)

    let task: any = calSchedules.map((schedule) => {
      if (schedule.availability?.create) {
        for (const p of schedule.availability?.create) {
          p.userId = userId;
        }
      }
      return prisma.schedule.create({ data: { ...schedule, userId } });
    })

    await Promise.all(task)
  } catch (err) {
    console.error(`initDoctorCalSchedule accountId:${accountId} doctorId: ${doctorId} error`, err);
  }
}

export function getRandomString(len: number): string {
  const _charStr = "abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789";
  function RandomIndex(min: number, max: number, i: number) {
    let index = Math.floor(Math.random() * (max - min + 1) + min);
    const numStart: number = _charStr.length - 10;
    // If the first digit of the string is a number, then recursively re-fetch
    if (i == 0 && index >= numStart) {
      index = RandomIndex(min, max, i);
    }
    return index;
  }

  const min = 0,
    max = _charStr.length - 1;
  let _str = "";
  // Determine whether to specify the length, otherwise the default length is 15
  len = len || 15;
  // Loop to generate a string
  for (let i = 0, index; i < len; i++) {
    index = RandomIndex(min, max, i);
    _str += _charStr[index];
  }
  return _str;
}
