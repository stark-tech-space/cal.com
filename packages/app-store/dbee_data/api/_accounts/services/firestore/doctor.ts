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
  console.log('==========1.1.1')
  const doctorSnap = await firestore.doc(`accounts/${accountId}/doctors/${doctorId}`).get();
  console.log('==========1.1.2')
  return doctorSnap.exists ? (doctorSnap.data() as Doctor) : null;
}
