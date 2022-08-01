export type BookingPayload = {
  triggerEvent: string; // 'BOOKING_CREATED', 'BOOKING_RESCHEDULED', 'BOOKING_CANCELLED'
  createdAt: string; // '2022-07-01T02:21:08.701Z'
  payload: {
    type: string; // event type name
    title: string; // booking title
    description: string; // same as additionalNotes...
    additionalNotes?: string; // Does not show up on cancellations
    customInputs: object; // Additional input fields { string or boolean } (Number input is checked but returned as string)
    startTime: string; // '2022-07-04T08:00:00+08:00'
    endTime: string; // '2022-07-04T08:00:00+08:00'
    organizer: Person; // doctor
    attendees: Array<Person>; // Array of Persons, only organizer will have name, the additional guests' names will be empty
    location: string;
    destinationCalendar: null; // not sure which type
    hideCalendarNotes?: boolean; // Does not show up on cancellations
    requiresConfirmation: boolean; // Does not show up on cancellations
    eventTypeId?: number; // Does not show up on cancellations
    uid: string; // On reschedules, will show old uid
    bookingId?: number; // Does not show up on cancellations
    rescheduleUid?: string; // Only shows up on reschedules. Replaces old uid
    metadata?: object; // Does not show up on cancellations
    cancellationReason: string; // Only shows up on cancellations
    teamName?: string; // team?.name	Name of the team booked     Did not see because booking was not from team
    teamMembers?: string[]; // team?.members 	Members of the team booked
  };
};

type Person = {
  name: string;
  email: string;
  timeZone: string;
  language: { locale: string }; // e.g. locale: 'en' for english
};

export enum triggerEventTypes {
  CREATED = 'BOOKING_CREATED',
  RESCHEDULED = 'BOOKING_RESCHEDULED',
  CANCELLED = 'BOOKING_CANCELLED',
}

export enum ERROR_CODE {
  NOT_FOUND = 'NOT_FOUND',
  FIELD_ERROR = 'FIELD_ERROR',
  NO_SEATS = 'NO_SEATS',
}