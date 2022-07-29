export type CalSchedule = {
  id: number;
  userId: number;
  eventTypeId: number;
  days: Array<number>;
  startTime: string;
  endTime: string;
  date: null;
  scheduleId: number;
};

export type TimeSlot = {
  start: number;
  startTimeString: string;
  max: number;
  current: number;
  treatments: Array<string>;
};

export enum WeekDay {
  MON = 'Monday',
  TUE = 'Tuesday',
  WED = 'Wednesday',
  THU = 'Thursday',
  FRI = 'Friday',
  SAT = 'Saturday',
  SUN = 'Sunday',
}

export enum WeekDayTrans {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}

export enum AvailabilityType {
  OPD = 'OPD', // 門診
  TREATMENT = 'TREATMENT', // 療程
}

export const TIMEZONE = 'Asia/Taipei';

export type AvailabilityItem = {
  start: number;
  end: number;
  type: string;
  treatments: Array<string>;
};
