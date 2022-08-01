import { firestore } from '../../firebase';
import { Treatment } from '../../types/treatment';
export default async function getTreatment({
  accountId,
  treatmentId,
}: {
  accountId: string;
  treatmentId: string;
}) {
  if (!accountId || !treatmentId) return null;
  const treatmentSnap = await firestore
    .doc(`accounts/${accountId}/treatments/${treatmentId}`)
    .get();
  return treatmentSnap.exists ? (treatmentSnap.data() as Treatment) : null;
}
