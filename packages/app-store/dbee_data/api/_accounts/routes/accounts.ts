import express, { Request, Response } from 'express';
import prisma from "@calcom/prisma";
import doctors from './doctors';
import bookings from './bookings';
import create from "./accounts/create";

const router = express.Router();

/**
 * create user
 */
router.post('/user', create)

/**
 * delete user
 */
router.delete('/user', (req: Request, res: Response) => {
  const { accountId } = req.params

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
