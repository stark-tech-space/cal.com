import { AvailabilityType } from './doctor';
import { BasicField, Field } from './form';
import { PatientField } from './patient';

export enum AppointmentStatus {
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  NOT_CHECK_IN = 'NOT_CHECK_IN',
  CANCELLED_BY_CLINIC = 'CANCELLED_BY_CLINIC',
  CANCELLED_BY_PATIENT = 'CANCELLED_BY_PATIENT',
}

export type FilledFormField = Field & { value: { id: string; name: string; value: string } };
export type FilledBasicFormField = BasicField & { value: string };

export type Appointment = {
  groupId: string; // ${doctorId}${type}${treatmentId}${start time string(yyyyMMddHH:mm)}
  type: AvailabilityType;
  patientId: string;
  doctor: {
    id: string;
    name: string;
    division: string;
    jobTitle: string;
  };
  treatment: {
    id: string;
    name: string;
  };
  start: Date;
  end: Date;
  formId: string;
  formFields: Array<FilledFormField>;
  formBasicFields: Array<FilledBasicFormField>;
  seatNumber: number;
  maxSeats: number;
  status: AppointmentStatus;
  note: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  statusRecord: Partial<Record<AppointmentStatus, FirebaseFirestore.Timestamp>>;
  calBookingId: number
};

export type CreateAppointmentRequest = {
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