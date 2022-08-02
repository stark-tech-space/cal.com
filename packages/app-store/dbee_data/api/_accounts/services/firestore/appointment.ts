import { firestore } from '../../firebase';
import { Appointment } from '../../types/appointment';

export default async function getAppointment(
  accountId: string,
  calBookingId: number,
): Promise<Appointment | null> {
  const appointmentsSnap = await firestore
    .collection(`accounts/${accountId}/appointments`)
    .where('calBookingId', '==', calBookingId)
    .limit(1)
    .get();
  return appointmentsSnap.docs.length > 0 ? (appointmentsSnap.docs[0].data() as Appointment) : null;
}