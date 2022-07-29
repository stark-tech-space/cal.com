import express, { Request, Response } from 'express';
import doctors from './doctors';
import bookings from './bookings';
import create from "./accounts/create";

const router = express.Router();

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
