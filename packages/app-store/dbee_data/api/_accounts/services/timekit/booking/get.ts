import timekitInstance from '../init';
import axios from 'axios';

import { Booking } from '../../../types/timekit/booking';

export default async function timekitBookingGet(id: string): Promise<Booking | null> {
  try {
    const response = await timekitInstance.get(`bookings/${id}`);

    return response.data.data as Booking;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`get booking for booking ${id} axios error`, error.response?.data || error);
    } else {
      console.error(`get booking for booking ${id} error`, error);
    }
    return null;
  }
}
