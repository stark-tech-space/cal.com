import express, { Request, Response } from 'express';
import doctors from './doctors';
import bookings from './bookings';
import create from "./accounts/create";
import prisma from "@calcom/prisma";

const router = express.Router();


/**
 * uniqueness verification
 */
router.get('/emails/:email', async (req: Request, res: Response) => {
  const { email } = req.params

  if (!email) return res.status(400).send('email require');
  const user = await prisma.user.findFirst({
    where: {
      email: email
    }
  })

  let exists = false
  if (user) exists = true

  res.json({ exists })
})

/**
 * create user
 */
router.post('/user', create)

/**
 * doctors routes
 */
router.use('/doctors', doctors);

/**
 * bookings routes
 */
router.use('/bookings', bookings);
export default router;
