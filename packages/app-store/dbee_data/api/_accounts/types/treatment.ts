export type Treatment = {
  name: string;
  maxSeats: number;
  isPublic: boolean;
  duration: number;
  formId: string;
};

export type TreatmentWithId = Treatment & { id: string };
