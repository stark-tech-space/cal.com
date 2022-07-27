export type CalScheduleCreateRequest = {
  name: string;
  timeZone: string;
  userId: number; // userId in cal
  availability?: CalAvailabilitiesCreateRequest; // alphanumeric lowercase characters and normal dashes
  eventType: {
    connect: Array<{id:number}>
  }
};

export type CalAvailabilitiesCreateRequest = {
  create: Array<CalAvailabilityCreateRequest>
}

export type CalAvailabilityCreateRequest = {
  days: Array<number>,
  startTime: Date,
  endTime: Date,
  eventTypeId: number,
  userId?: number
}

type responseSchedule = {
  id: number,
  userId: number,
  name: string,
  timeZone: string
}

export type CreateScheduleResponse = {
  schedule: responseSchedule,
  message: string
}

