import { Request, Response } from 'express';
import prisma from "@calcom/prisma";
import { hashAPIKey } from "@calcom/ee/lib/api/apiKeys";
import { initDoctorCalSchedule, getRandomString } from "../../utils/index"
import { Doctor } from '../../types/doctor'
import { v4 as uuidv4 } from "uuid";

export default async (req: Request, res: Response) => {
  // If user is not ADMIN, return unauthorized.
  // if (!isAdmin) throw new HttpError({ statusCode: 401, message: "You are not authorized" });

  const data: Doctor = req.body;

  const { accountId } = res.locals

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      timeZone: 'Asia/Taipei',
      username: data.doctorId.toLowerCase(),
      bufferTime: data.bookingStartMinsModulus,
      password: '$2a$12$DdOFHYsG0foANWGU4h4d5eR38xrG8jH.3Bp4ZWRlrUrbyaABnmo5O', // defaultpass
      metadata: {
        accountId: accountId,
        doctorId: data.doctorId
      }
    }
  });

  // create webhook
  const webhook = await prisma.webhook.create({
    data: {
      id: uuidv4(), userId: user.id, subscriberUrl: `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/integrations/dbee_data/accounts/${accountId}/doctors/${data.doctorId}/bookingsHook`, eventTriggers: ['BOOKING_CREATED', 'BOOKING_RESCHEDULED', 'BOOKING_CANCELLED']
    }
  });

  console.log('========webhook', webhook)

  // create user apikey
  const apiKeyString = getRandomString(30);
  const hashedKey = hashAPIKey(apiKeyString);

  await prisma.apiKey.create({ data: { userId: user.id, hashedKey } });
  const apiKey = `${process.env.API_KEY_PREFIX || "cal_"}${apiKeyString}`

  // create event type and others
  if (data.availabilities) {
    // Initialize doctor in cal schedule, eventype
    await initDoctorCalSchedule(data.availabilities, user.id, accountId, data.doctorId)
  }

  res.status(200).json({ user, apiKey })
}


