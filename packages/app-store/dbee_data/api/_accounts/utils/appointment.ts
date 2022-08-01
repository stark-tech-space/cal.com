import express, { Request, Response } from 'express';
import { firestore, Timestamp } from '../firebase';

import parseISO from 'date-fns/parseISO';
import isValid from 'date-fns/isValid';
import isAfter from 'date-fns/isAfter';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import addMinutes from 'date-fns/addMinutes';
import utcToZonedTime from 'date-fns-tz/utcToZonedTime';
import { isValidNumber } from 'libphonenumber-js';
import isIdNumber from './isIdNumber';

import getDoctor from '../services/firestore/doctor';
import getTreatment from '../services/firestore/treatment';
import getForm from '../services/firestore/form';

import { Availability, AvailabilityType } from '../types/doctor';
import { Gender, WeekDay } from '../types/common';
import { CountDoc } from '../types/count';
import { BasicField, defaultBasicField, Field, FieldType, Option } from '../types/form';
import { Appointment, AppointmentStatus, FilledFormField } from '../types/appointment';
import { PatientField } from '../types/patient';
import { AccountWithId } from '../types/account';
import { TIMEZONE, emailRegex } from '../constants';

const router = express.Router();

type CreateAppointmentRequest = {
  doctorId: string;
  patientId: string;
  start: string;
  note: string;
  type: AvailabilityType;
  treatment: {
    id: string;
    name: string;
    duration: number;
  };
  basicFields: Array<{ id: PatientField; value: string }>;
  fields: Array<{
    id: string;
    value: { id: string; name: string; value: string };
  }>;
};

enum ErrorCode {
  INVALID_TIME = 'INVALID_TIME',
  NO_OPD_TIME = 'NO_OPD_TIME',
  FIELD_ERROR = 'FIELD_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

const errorCodeStatusMapping: Record<ErrorCode, number> = {
  [ErrorCode.FIELD_ERROR]: 400,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.NO_OPD_TIME]: 400,
  [ErrorCode.INVALID_TIME]: 400,
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
};

const checkBasicField = ({ id, value }: { id: PatientField; value: string }) => {
  switch (id) {
    case PatientField.ADDRESS:
      return value.length > 0;
    case PatientField.BIRTHDAY: {
      const date = parse(value, 'yyyy-MM-dd', new Date());
      return isValid(date) && isAfter(new Date(), date);
    }
    case PatientField.EMAIL:
      return emailRegex.test(value);
    case PatientField.GENDER:
      return value === Gender.NONE || value === Gender.FEMALE || value === Gender.MALE;
    case PatientField.ID_NUMBER:
      return isIdNumber(value);
    case PatientField.INTRODUCER:
      return true;
    case PatientField.NAME:
      return true;
    case PatientField.PHONE:
      return isValidNumber(value);
    default:
      return false;
  }
};

const checkBasicFields = ({
  formBasicFields,
  basicFields,
}: {
  formBasicFields: Array<BasicField>;
  basicFields: Array<{ id: PatientField; value: string }>;
}) => {
  return formBasicFields.map((formBasicField) => {
    const value = basicFields.find(({ id }) => id === formBasicField.id);
    if (
      (!value && formBasicField.isRequired) ||
      (value && !value.value && formBasicField.isRequired) ||
      (value && value.value && !checkBasicField(value))
    ) {
      throw new Error(ErrorCode.FIELD_ERROR);
    }

    return { ...(value || { value: '' }), ...formBasicField };
  });
};

const checkFormFieldByEach = ({
  type,
  options = [],
  optionId,
  value,
}: {
  type: FieldType;
  options?: Array<Option>;
  optionId: string;
  value: string;
}) => {
  switch (type) {
    case FieldType.TEXTAREA:
      return !!value;
    case FieldType.PHONE:
      return isValidNumber(value);
    case FieldType.SELECT:
    case FieldType.RADIO: {
      const option = options.find(({ id }) => id === optionId);
      return option && ((option.withReason && !!value) || !option.withReason);
    }
    case FieldType.DATE: {
      const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
      return isValid(parsedDate);
    }
  }
};

const checkFormFields = ({
  formFields,
  fields,
}: {
  formFields: Array<Field>;
  fields: Array<{
    id: string;
    value: { id: string; name: string; value: string };
  }>;
}) => {
  return formFields.map((formField) => {
    const input = fields.find(({ id }) => id === formField.id);
    if (
      !input ||
      (formField.isRequired &&
        checkFormFieldByEach({
          type: formField.type,
          // @ts-ignore
          options: formField.options,
          optionId: input.value.id,
          value: input.value.value,
        }))
    ) {
      throw new Error(ErrorCode.FIELD_ERROR);
    }

    return { ...formField, value: input.value || '' };
  });
};

const generateSeatNumber = async ({
  accountId,
  groupId,
  dateString,
  maxSeats,
}: {
  accountId: string;
  groupId: string;
  dateString: string;
  maxSeats: number;
}) => {
  const countRef = firestore.doc(`accounts/${accountId}/counts/${dateString}`);
  return firestore.runTransaction(async (transaction) => {
    const countSnap = await transaction.get(countRef);

    const countDoc = countSnap.exists ? (countSnap.data() as CountDoc) : {};

    const nextCount = (countDoc[groupId]?.cur || 0) + 1;

    if (countSnap.exists) {
      transaction.update(countRef, {
        [groupId]: { cur: nextCount, max: maxSeats },
      });
    } else {
      transaction.create(countRef, {
        [groupId]: { cur: nextCount, max: maxSeats },
      });
    }

    return nextCount;
  });
};

export async function createTreatmentAppointment({
  account: { id: accountId, ...accountDoc },
  doctorId,
  patientId,
  treatment,
  startISODate,
  basicFields,
  fields,
  note,
  bookingId
}: {
  account: { id: string };
  doctorId: string;
  patientId: string;
  treatment: {
    id: string;
    name: string;
    duration: number;
  };
  startISODate: Date;
  basicFields: Array<{ id: PatientField; value: string }>;
  fields: Array<{
    id: string;
    value: { id: string; name: string; value: string };
  }>;
  note: string;
  bookingId: number
}) {
  const startDate = utcToZonedTime(startISODate, TIMEZONE);
  const doctorDoc = await getDoctor({ accountId, doctorId });

  const treatmentDoc = await getTreatment({
    accountId,
    treatmentId: treatment.id,
  });

  if (!accountDoc || !doctorDoc) {
    throw new Error(ErrorCode.NOT_FOUND);
  }

  if ((!treatment.id && !treatment.name) || treatment.duration <= 0) {
    throw new Error(ErrorCode.INVALID_TIME);
  }

  const [dateString, timeString, weekDay] = format(startDate, 'yyyy-MM-dd|HH:mm|EEEE').split('|');
  const [hourString, minuteString] = timeString.split(':');
  const startMinutes = parseInt(hourString) * 60 + parseInt(minuteString);
  const endISODate = addMinutes(startISODate, treatment.duration);
  const endDate = addMinutes(startDate, treatment.duration);
  const endDateTimeString = format(endDate, 'HH:mm');
  const endMinutes = startMinutes + treatment.duration;

  const { extraAvailabilities, availabilities } = doctorDoc;

  const extraDayAvailabilities = extraAvailabilities[dateString];

  let availability: Availability | null | undefined = null;
  if (extraDayAvailabilities) {
    availability = extraDayAvailabilities.find(
      ({ start, end, type, treatments }) =>
        type === AvailabilityType.TREATMENT &&
        ((start <= startMinutes && endMinutes <= end) ||
          (start >= startMinutes && endMinutes <= end) ||
          (start <= startMinutes && end <= endMinutes)) &&
        treatments.some(({ id }) => id === treatment.id),
    );
  } else {
    const weeklyAvailabilities = availabilities[weekDay as WeekDay];
    availability = weeklyAvailabilities.find(
      ({ start, end, type, treatments }) =>
        type === AvailabilityType.TREATMENT &&
        ((start <= startMinutes && endMinutes <= end) ||
          (start >= startMinutes && endMinutes <= end) ||
          (start <= startMinutes && end <= endMinutes)) &&
        treatments.some(({ id }) => id === treatment.id),
    );
  }

  const treatmentSettingInAvailability = availability?.treatments.find(
    ({ id }) => id === treatment.id,
  ) || {
    id: treatment.id,
    name: treatment.name,
    duration: treatment.duration,
    maxSeats: 1,
    isPublic: false,
  };

  const form = await getForm({
    accountId,
    formId: treatmentDoc?.formId,
  });

  const filledFormBasicFields = checkBasicFields({
    formBasicFields: form?.basicFields || defaultBasicField,
    basicFields: basicFields,
  });

  const filledFormFields: Array<FilledFormField> = checkFormFields({
    formFields: form?.fields || [],
    fields,
  });

  const appointmentDocRef = firestore.collection(`accounts/${accountId}/appointments`).doc();

  const groupId = `${doctorId}|${AvailabilityType.TREATMENT}|${dateString}|${timeString}|${endDateTimeString}`;

  const searNumber = await generateSeatNumber({
    accountId,
    groupId,
    dateString,
    maxSeats: treatmentSettingInAvailability.maxSeats,
  });

  const appointment: Appointment = {
    groupId,
    type: AvailabilityType.TREATMENT,
    patientId,
    doctor: {
      id: doctorId,
      name: doctorDoc.name,
      division: doctorDoc.division,
      jobTitle: doctorDoc.jobTitle,
    },
    treatment: {
      id: treatment.id,
      name: treatment.name,
    },
    start: startISODate,
    end: endISODate,
    formId: '',
    formFields: filledFormFields,
    formBasicFields: filledFormBasicFields,
    seatNumber: searNumber,
    maxSeats: treatmentSettingInAvailability.maxSeats,
    status: AppointmentStatus.CONFIRMED,
    note: note || '',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    statusRecord: {
      CONFIRMED: Timestamp.now(),
    },
    bookingId
  };

  await appointmentDocRef.set(appointment);

  return appointmentDocRef.id;
};

export default router;
