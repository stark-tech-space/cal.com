import express, { Request, Response } from 'express';
import prisma from "@calcom/prisma";
import { hashAPIKey } from "@calcom/ee/lib/api/apiKeys";
import { initDoctorCalSchedule, getRandomString } from "../utils/index"
import { Availability } from '../types/doctor'
import { WeekDay } from '../types/common';
import findValidApiKey from "@calcom/ee/lib/api/findValidApiKey";

const indexRouter = express.Router();
const router = express.Router();

indexRouter.get(`/`, (req: Request, res: Response) => {
  res.send('/:accountId/doctors')
})

indexRouter.use('/:doctorId', router);

router.get(`/treatments`, (req: Request, res: Response) => {
  res.send('/:accountId/doctors/:doctorId/treatments')
})

router.put('/:doctorId/schedule', async (req: Request, res: Response) => {
  const apiKey = req.query.apiKey as string;

  if (!apiKey) {
    return res.status(401).json({ message: "No API key provided" });
  }

  const validKey = await findValidApiKey(apiKey);

  if (!validKey) {
    return res.status(401).json({ message: "API key not valid" });
  }

  const data: Record<WeekDay, Array<Availability>> = req.body;

  const query: any = req.query

  const accountId: string = query.args[2]
  const doctorId: string = query.args[4]

  await initDoctorCalSchedule(data, validKey.userId, accountId, doctorId)

  res.status(200).json({ success: 1 })
})

router.post(`/bookings`, (req: Request, res: Response) => {
  res.send('booking create')
})

router.get(`/schedule`, (req: Request, res: Response) => {
  res.send('/:accountId/doctors/:doctorId/schedule')
})

export default router;
