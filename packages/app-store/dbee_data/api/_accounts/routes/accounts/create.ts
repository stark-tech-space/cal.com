import { Request, Response } from 'express';
import prisma from "@calcom/prisma";
import { hashAPIKey } from "@calcom/ee/lib/api/apiKeys";
import { initDoctorCalSchedule, getRandomString } from "../../utils/index"
import { Doctor } from '../../types/doctor'

export default async (req: Request, res: Response) => {
  // If user is not ADMIN, return unauthorized.
  // if (!isAdmin) throw new HttpError({ statusCode: 401, message: "You are not authorized" });

  const data: Doctor = req.body;
  const { accountId } = req.params

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      timeZone: 'Asia/Taipei',
      username: data.doctorId.toLowerCase(),
      metadata: {
        accountId: accountId
      }
    }
  });

  // create user apikey
  const apiKeyString = getRandomString(30);
  const hashedKey = hashAPIKey(apiKeyString);

  await prisma.apiKey.create({ data: { userId: user.id, hashedKey } });
  const apiKey = `${process.env.API_KEY_PREFIX || "cal_"}${apiKeyString}`

  // create event type and others
  if (data.availabilities) {
    // Initialize doctor in cal schedule, eventype
    await initDoctorCalSchedule(data.availabilities, user.id, accountId, data.name, data.doctorId)
  }

  res.status(200).json({ user, apiKey })
}


