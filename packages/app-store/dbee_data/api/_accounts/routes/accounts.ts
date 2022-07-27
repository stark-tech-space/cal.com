import express, { Request, Response } from 'express';
import doctors from './doctors';
const router = express.Router();

/**
 * create user
 */
router.post('/user', (req: Request, res: Response) => {
  const { accountId } = req.params
  res.send('post user')
})

/**
 * delete user
 */
router.delete('/user', (req: Request, res: Response) => {
  const { accountId } = req.params
  res.send('delete user')
})

/**
 * get bookings
 */
router.get('/bookings`', (req: Request, res: Response) => {
  res.send('get bookings')
})

/**
 * doctors routes
 */
router.use('/doctors', doctors);

export default router;
