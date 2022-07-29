import {
  add,
  addDays,
  addMinutes,
  differenceInDays,
  format,
  isPast,
  parseISO,
  startOfDay,
  getMinutes,
  getHours
} from 'date-fns';
import {
  AvailabilityItem,
  AvailabilityType,
  CalSchedule,
  TimeSlot,
  TIMEZONE,
  WeekDay,
  WeekDayTrans,
} from '../types/schedule';

import range from 'lodash/range';

const convertTime = (dateString: string) => {
  const date = new Date(dateString)
  return (getMinutes(date) + getHours(date) * 60)
};

export const convertAvailabilities = (schedule: Array<CalSchedule>) => {
  const availabilities: Record<string, AvailabilityItem[]> = {};
  for (const key in WeekDayTrans) {
    if (Number(key) || Number(key) == 0) {
      const scheduleItems = schedule.filter((c) => c.days[0] === parseInt(key));

      const availabilityItems = scheduleItems.map((item: CalSchedule) => {
        const start = convertTime(new Date(item.startTime).toLocaleString())
        const end = convertTime(new Date(item.endTime).toLocaleString())

        return {
          start,
          type: 'TREATMENT',
          end,
          treatments: [],
        };
      });
      availabilities[WeekDayTrans[key]] = availabilityItems;
    }
  }
  return availabilities;
};

export const convertSchedule = async (
  start: any,
  end: any,
  duration: number,
  bookingStartMinsModulus: number,
  schedule: Array<CalSchedule>,
) => {
  const startISODate = parseISO(start);
  const endISODate = parseISO(end);

  // dont need to check past time
  const startDate = (isPast(startISODate) ? new Date() : startISODate);
  const endDate = endISODate;

  const differenceDays = differenceInDays(endDate, startDate);
  const availabilities = convertAvailabilities(schedule);

  const queryEntriesResults = await Promise.allSettled(
    range(0, differenceDays).map<Promise<[string, Array<TimeSlot>]>>(async (dateIndex: number) => {
      const targetDate = startOfDay(addDays(startDate, dateIndex));
      const weekday = format(targetDate, 'EEEE') as WeekDay;
      const formatDate = format(targetDate, 'yyyy-MM-dd');

      const availabilitiesOfDate = availabilities[weekday];
      const timeSlots = availabilitiesOfDate.flatMap<TimeSlot>(
        ({ start, end, type, treatments }) => {
          if (type === AvailabilityType.OPD) {
            return [];
          }
          const startTime = Math.ceil(start / bookingStartMinsModulus) * bookingStartMinsModulus;
          const endTime =
            Math.floor((end - duration) / bookingStartMinsModulus) * bookingStartMinsModulus;
          if (endTime < startTime) {
            return [];
          }

          return range((endTime - startTime) / bookingStartMinsModulus + 1).map(
            (timeIndex: number) => {
              const queryStartMinutes = startTime + timeIndex * bookingStartMinsModulus;

              return {
                start: queryStartMinutes,
                startTimeString: format(addMinutes(targetDate, queryStartMinutes), 'HH:mm'),
                current: 0,
                max: 1,
                treatments: [], //treatments.map(({ id }) => id),
              };
            },
          );
        },
      );
      return [formatDate, timeSlots];
    }),
  );

  const resultEntries = queryEntriesResults.reduce<Array<[string, Array<TimeSlot>]>>(
    (prev: any, result: any) => {
      if (result.status === 'fulfilled') {
        prev.push(result.value);
      }
      return prev;
    },
    [],
  );

  return Object.fromEntries(resultEntries);
};
