import timekitInstance from '../init';
import axios from 'axios';

import { Booking } from '../../../types/timekit/booking';

export default async function timekitBookingCancel(id: string): Promise<Booking | null> {
  try {
    const response = await timekitInstance.put(`bookings/${id}/cancel`, {});

    return response.data.data as Booking;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`cancel booking for booking ${id} axios error`, error.response?.data || error);
    } else {
      console.error(`cancel booking for booking ${id} error`, error);
    }
    return null;
  }
}
