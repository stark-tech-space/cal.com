import { Gender } from './common';

export enum PatientField {
  PHONE = 'phone',
  NAME = 'name',
  GENDER = 'gender',
  BIRTHDAY = 'birthday',
  ID_NUMBER = 'idNumber',
  EMAIL = 'email',
  ADDRESS = 'address',
  INTRODUCER = 'introducer',
}

export enum InvalidUser {
  NONE = '',
  EMPTY_PHONE = 'EMPTY_PHONE',
  INVALID_PHONE = 'INVALID_PHONE',
  DUPLICATE_PHONE = 'DUPLICATE_PHONE',
}

export type Patient = {
  assignedUsers: Array<string>;
  number: string;
  tags: Array<string>;
  [PatientField.NAME]: string;
  [PatientField.GENDER]: Gender | string;
  [PatientField.BIRTHDAY]: string; // yyyy-MM-dd
  [PatientField.ID_NUMBER]: string;
  [PatientField.PHONE]: string;
  [PatientField.EMAIL]: string;
  [PatientField.ADDRESS]: string;
  [PatientField.INTRODUCER]: string;
  invalidUser: InvalidUser;
  note: string;
  lastVisitAt: FirebaseFirestore.Timestamp | null;
  contactId: string;
};
export type PatientWithId = Patient & { id: string };

export const emptyPatient: Patient = {
  assignedUsers: [],
  [PatientField.ADDRESS]: '',
  [PatientField.NAME]: '',
  [PatientField.GENDER]: Gender.NONE,
  [PatientField.BIRTHDAY]: '',
  [PatientField.ID_NUMBER]: '',
  [PatientField.PHONE]: '',
  [PatientField.EMAIL]: '',
  [PatientField.INTRODUCER]: '',
  invalidUser: InvalidUser.EMPTY_PHONE,
  number: '',
  tags: [],
  note: '',
  lastVisitAt: null,
  contactId: '',
};
