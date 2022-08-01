import { firestore } from '../../firebase';
import { Doctor } from '../../types/doctor';
export default async function getDoctor({
  accountId,
  doctorId,
}: {
  accountId: string;
  doctorId: string;
}) {
  if (!accountId || !doctorId) return null;

  const doctorSnap = await firestore.doc(`accounts/${accountId}/doctors/${doctorId}`).get();

  return doctorSnap.exists ? (doctorSnap.data() as Doctor) : null;
}
