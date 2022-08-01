import { firestore } from '../../firebase';
import { Form } from '../../types/form';

export default async function getForm({
  accountId,
  formId,
}: {
  accountId: string;
  formId: string;
}) {
  if (!accountId || !formId) return null;
  const formSnap = await firestore.doc(`accounts/${accountId}/forms/${formId}`).get();
  const formData = formSnap.data() as Form;
  return formSnap.exists && !formData.deletedAt ? formData : null;
}
