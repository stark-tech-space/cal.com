import express, { Request, Response } from 'express';
import doctors from './doctors';
import create from "./accounts/create";
import prisma from "@calcom/prisma";
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
router.get('/bookings`', (req: Request, res: Response) => {
  const { accountId } = res.locals;
  res.send('get bookings')
})

/**
 * doctors routes
 */
router.use('/doctors', doctors);

export default router;
