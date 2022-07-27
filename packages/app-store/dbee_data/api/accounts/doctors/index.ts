import type { NextApiRequest, NextApiResponse } from "next/types";
import { useRouter } from 'next/router'
import express from 'express';

import scheduleUpdate from './scheduleUpdate'
import bookingCreate from './bookingCreate'

const app = express();

import { Request, Response } from 'express';

export default async (req: Request, res: Response) => {

  app.get(`/treatments`, (req, res) => {

    res.send('/:accountId/doctors/:doctorId/treatments')
  })

  app.get(`/doctors`, (req, res) => {

    res.send('/:accountId/doctors')
  })

  app.put(`/schedule`, scheduleUpdate)

  app.post(`/bookings`, bookingCreate)

  app.get(`/schedule`, (req, res) => {

    res.send('/:accountId/doctors/:doctorId/schedule')
  })

  app.use(`/:doctorId`,(req, res) => {

    res.send('/:accountId/doctors/:doctorId/schedule')
  })


  app(req, res);

}
