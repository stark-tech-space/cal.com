import { PatientField } from './patient';

export enum FieldType {
  TEXTAREA,
  RADIO,
  SELECT,
  DATE,
  PHONE,
}

export type Option = {
  id: string; // option uniq id
  value: string; // option name
  withReason?: boolean; // need a textarea with checked
};

export type Field = {
  id: string; // field uniq id,
  name: string; // field name
  isRequired: true; // is field required
} & (
  | {
      type: FieldType.TEXTAREA | FieldType.DATE | FieldType.PHONE;
    }
  | {
      type: FieldType.RADIO;
      options: Array<Option>; // withReason defined
    }
  | {
      type: FieldType.SELECT;
      options: Array<Option>; // withReason undefined
    }
);

export type BasicField = {
  id: PatientField;
  isRequired: boolean;
};

export type Form = {
  basicFields: Array<BasicField>;
  fields: Array<Field>;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  deletedAt: FirebaseFirestore.Timestamp | null;
};

export const defaultBasicField: Array<BasicField> = [
  { id: PatientField.NAME, isRequired: true },
  { id: PatientField.GENDER, isRequired: false },
  { id: PatientField.BIRTHDAY, isRequired: false },
  { id: PatientField.ID_NUMBER, isRequired: false },
  { id: PatientField.PHONE, isRequired: false },
  { id: PatientField.EMAIL, isRequired: true },
  { id: PatientField.ADDRESS, isRequired: false },
];
