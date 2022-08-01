import timekitInstance from '../init';
import axios from 'axios';

import { CreateBookingRequest, Booking } from '../../../types/timekit/booking';

export default async function timekitBookingCreate(
  request: CreateBookingRequest,
): Promise<Booking | null> {
  try {
    const response = await timekitInstance.post('bookings', request);

    return response.data.data as Booking;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `create booking for request ${JSON.stringify(request)} axios error`,
        error.response?.data || error,
      );
    } else {
      console.error(`create resource for account ${JSON.stringify(request)} error`, error);
    }
    return null;
  }
}
