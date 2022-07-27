import express, { Request, Response } from 'express';

const indexRouter = express.Router();
const router = express.Router();

indexRouter.get(`/`, (req: Request, res: Response) => {
  res.send('/:accountId/doctors')
})

indexRouter.use('/:doctorId', router);

router.get(`/treatments`, (req: Request, res: Response) => {
  res.send('/:accountId/doctors/:doctorId/treatments')
})

router.put(`/schedule`, (req: Request, res: Response) => {
  res.send('schedule update')
})

router.post(`/bookings`, (req: Request, res: Response) => {
  res.send('booking create')
})

router.get(`/schedule`, (req: Request, res: Response) => {
  res.send('/:accountId/doctors/:doctorId/schedule')
})

export default router;
