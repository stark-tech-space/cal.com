import type { NextApiRequest, NextApiResponse } from "next/types";
import { useRouter } from 'next/router'
import express from 'express';

import scheduleUpdate from './doctors/scheduleUpdate'
import userDelete from './userDelete'
import userCreate from "./userCreate";
import bookingCreate from './doctors/bookingCreate'

const app = express();

const baseUrl = '/api/integrations/dbee_data/accounts'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  app.post(`${baseUrl}/:accountId/user`, userCreate)

  app.delete(`${baseUrl}/:accountId/user`, userDelete)

  app.put(`${baseUrl}/:accountId/doctors/:doctorId/schedule`, scheduleUpdate)

  app.post(`${baseUrl}/:accountId/doctors/:doctorId/bookings`, bookingCreate)

  app.get(`${baseUrl}/:accountId/doctors/:doctorId/schedule`, (req, res) => {

    res.send('/:accountId/doctors/:doctorId/schedule')
  })

  app.get(`${baseUrl}/:accountId/bookings`, (req, res) => {

    res.send('/:accountId/bookings')
  })

  app.get(`${baseUrl}/:accountId/doctors/:doctorId/bookings`, (req, res) => {

    res.send('/:accountId/doctors/:doctorId/bookings')
  })

  app.get(`${baseUrl}/:accountId/doctors/:doctorId/treatments`, (req, res) => {

    res.send('/:accountId/doctors/:doctorId/treatments')
  })

  app.get(`${baseUrl}/:accountId/doctors`, (req, res) => {

    res.send('/:accountId/doctors')
  })


  app(req, res);

}
