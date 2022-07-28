import { Timestamp } from '../firebase';
import { WeekDay } from './common';
import { PatientField } from './patient';

export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
}

export enum FieldPermission {
  HIDE = 'HIDE',
  MASKED = 'MASKED',
  SHOW = 'SHOW',
}

export enum AccountPermissionField {
  ASSIGNED = 'roleAssignedFieldPermissions',
  UNASSIGNED = 'roleUnassignedFieldPermissions',
}

export type PatientFieldPermission = Record<Role, Record<PatientField, FieldPermission>>; // { [Role]: { [PatientField]: FieldPermission } }

export type Account = {
  admins: Array<string>; // uid array
  agents: Array<string>; // uid array
  owners: Array<string>; // uid array
  userRoles: Record<string, Role>; // { [uid]: Role }
  createdAt: FirebaseFirestore.Timestamp;
  messagebirdId: string;
  name: string;
  operatingTime: Record<WeekDay, Array<{ start: number; end: number }>>;
  permissionsUpdatedAt: FirebaseFirestore.Timestamp;
  roleAssignedShow: Record<Role, boolean>;
  roleUnassignedShow: Record<Role, boolean>;
  [AccountPermissionField.ASSIGNED]: PatientFieldPermission;
  [AccountPermissionField.UNASSIGNED]: PatientFieldPermission;
  defaultFormId: string;
};
export type AccountWithId = Account & { id: string };

export type Count = Record<string, { cur: number; max: number }>;

export const emptyAccount: Account = {
  admins: [],
  agents: [],
  owners: [],
  userRoles: {},
  createdAt: Timestamp.fromDate(new Date()),
  messagebirdId: '',
  name: 'test account',
  permissionsUpdatedAt: Timestamp.fromDate(new Date()),
  defaultFormId: '',
  operatingTime: {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  },
  roleAssignedShow: {
    [Role.ADMIN]: true,
    [Role.AGENT]: true,
    [Role.OWNER]: true,
  },
  roleUnassignedShow: {
    [Role.ADMIN]: true,
    [Role.AGENT]: true,
    [Role.OWNER]: true,
  },
  [AccountPermissionField.ASSIGNED]: {
    [Role.ADMIN]: {
      [PatientField.ADDRESS]: FieldPermission.SHOW,
      [PatientField.NAME]: FieldPermission.SHOW,
      [PatientField.BIRTHDAY]: FieldPermission.SHOW,
      [PatientField.EMAIL]: FieldPermission.SHOW,
      [PatientField.GENDER]: FieldPermission.SHOW,
      [PatientField.ID_NUMBER]: FieldPermission.SHOW,
      [PatientField.INTRODUCER]: FieldPermission.SHOW,
      [PatientField.PHONE]: FieldPermission.SHOW,
    },
    [Role.AGENT]: {
      [PatientField.ADDRESS]: FieldPermission.SHOW,
      [PatientField.NAME]: FieldPermission.SHOW,
      [PatientField.BIRTHDAY]: FieldPermission.SHOW,
      [PatientField.EMAIL]: FieldPermission.SHOW,
      [PatientField.GENDER]: FieldPermission.SHOW,
      [PatientField.ID_NUMBER]: FieldPermission.SHOW,
      [PatientField.INTRODUCER]: FieldPermission.SHOW,
      [PatientField.PHONE]: FieldPermission.SHOW,
    },
    [Role.OWNER]: {
      [PatientField.ADDRESS]: FieldPermission.SHOW,
      [PatientField.NAME]: FieldPermission.SHOW,
      [PatientField.BIRTHDAY]: FieldPermission.SHOW,
      [PatientField.EMAIL]: FieldPermission.SHOW,
      [PatientField.GENDER]: FieldPermission.SHOW,
      [PatientField.ID_NUMBER]: FieldPermission.SHOW,
      [PatientField.INTRODUCER]: FieldPermission.SHOW,
      [PatientField.PHONE]: FieldPermission.SHOW,
    },
  },
  [AccountPermissionField.UNASSIGNED]: {
    [Role.ADMIN]: {
      [PatientField.ADDRESS]: FieldPermission.SHOW,
      [PatientField.NAME]: FieldPermission.SHOW,
      [PatientField.BIRTHDAY]: FieldPermission.SHOW,
      [PatientField.EMAIL]: FieldPermission.SHOW,
      [PatientField.GENDER]: FieldPermission.SHOW,
      [PatientField.ID_NUMBER]: FieldPermission.SHOW,
      [PatientField.INTRODUCER]: FieldPermission.SHOW,
      [PatientField.PHONE]: FieldPermission.SHOW,
    },
    [Role.AGENT]: {
      [PatientField.ADDRESS]: FieldPermission.SHOW,
      [PatientField.NAME]: FieldPermission.SHOW,
      [PatientField.BIRTHDAY]: FieldPermission.SHOW,
      [PatientField.EMAIL]: FieldPermission.SHOW,
      [PatientField.GENDER]: FieldPermission.SHOW,
      [PatientField.ID_NUMBER]: FieldPermission.SHOW,
      [PatientField.INTRODUCER]: FieldPermission.SHOW,
      [PatientField.PHONE]: FieldPermission.SHOW,
    },
    [Role.OWNER]: {
      [PatientField.ADDRESS]: FieldPermission.SHOW,
      [PatientField.NAME]: FieldPermission.SHOW,
      [PatientField.BIRTHDAY]: FieldPermission.SHOW,
      [PatientField.EMAIL]: FieldPermission.SHOW,
      [PatientField.GENDER]: FieldPermission.SHOW,
      [PatientField.ID_NUMBER]: FieldPermission.SHOW,
      [PatientField.INTRODUCER]: FieldPermission.SHOW,
      [PatientField.PHONE]: FieldPermission.SHOW,
    },
  },
};
