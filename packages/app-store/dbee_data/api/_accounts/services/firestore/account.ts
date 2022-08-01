import { firestore } from '../../firebase';
import { Account } from '../../types/account';
export default async function getAccount(accountId: string) {
  if (!accountId) return null;
  const accountSnap = await firestore.doc(`accounts/${accountId}`).get();
  return accountSnap.exists ? (accountSnap.data() as Account) : null;
}
