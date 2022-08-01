import { firestore } from '../../firebase';
import { Count } from '../../types/account';

export default async function getCount({
  accountId,
  dateString,
}: {
  accountId: string;
  dateString: string;
}): Promise<Count> {
  if (!accountId || !dateString) return {};
  const countSnap = await firestore.doc(`accounts/${accountId}/counts/${dateString}`).get();
  return countSnap.exists ? (countSnap.data() as Count) : {};
}
