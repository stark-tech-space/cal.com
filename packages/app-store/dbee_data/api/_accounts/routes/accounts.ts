import express, { Request, Response } from 'express';
import prisma from "@calcom/prisma";
import doctors from './doctors';
import bookings from './bookings';
import create from "./accounts/create";
import { deleteDoctorCalEventype } from "../utils/index"

const router = express.Router();

/**
 * create user
 */
router.post('/user', create)

/**
 * delete user
 */
router.delete('/user', async (req: Request, res: Response) => {
  const query = req.query

  const user = await prisma.user.findUnique({ where: { id: Number(query.userId) } });

  if (!user) res.status(404).json({ message: "User not found" });

  const { eventTypes } = await prisma.user
    .findUnique({
      where: { id: user?.id },
      rejectOnNotFound: true,
      select: { eventTypes: true },
    })

  deleteDoctorCalEventype(eventTypes, user?.id, true)

  await prisma.user.delete({ where: { id: user?.id } });

  res.json({ success: 1 })
})

/**
 * get bookings
 */
router.get('/bookings`', async (req: Request, res: Response) => {
  res.send('get bookings')
})

/**
 * doctors routes
 */
router.use('/doctors', doctors);

/**
 * bookings routes
 */
router.use('/bookings', bookings);
export default router;
