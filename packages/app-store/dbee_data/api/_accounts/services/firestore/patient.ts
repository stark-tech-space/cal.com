import { firestore } from '../../firebase';
import { Patient } from '../../types/patient';
export default async function getPatient({
  accountId,
  patientId,
}: {
  accountId: string;
  patientId: string;
}) {
  if (!accountId || !patientId) return null;
  const patientSnap = await firestore.doc(`accounts/${accountId}/patients/${patientId}`).get();
  return patientSnap.exists ? (patientSnap.data() as Patient) : null;
}

export async function queryPatient({
  accountId,
  phoneNumber,
}: {
  accountId: string;
  phoneNumber: string;
}) {
  if (!accountId || !phoneNumber) return null;
  const patientQuerySnaps = await firestore
    .collection(`accounts/${accountId}/patients`)
    .where('PHONE', '==', phoneNumber)
    .get();
  return patientQuerySnaps.empty
    ? null
    : { ...(patientQuerySnaps.docs[0].data() as Patient), id: patientQuerySnaps.docs[0].id };
}
