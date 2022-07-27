import type { NextApiRequest, NextApiResponse } from "next/types";
import { useRouter } from 'next/router'
import express from 'express';

import scheduleUpdate from './doctors/scheduleUpdate'
import userDelete from './userDelete'
import userCreate from "./userCreate";
import bookingCreate from './doctors/bookingCreate'

import doctors from "./doctors/index";

const app = express();

const baseUrl = '/api/integrations/dbee_data/accounts'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  app.post(`${baseUrl}/:accountId/user`, userCreate)

  app.delete(`${baseUrl}/:accountId/user`, userDelete)

  app.get(`${baseUrl}/:accountId/bookings`, (req, res) => {

    res.send('/:accountId/bookings')
  })

  app.use(`${baseUrl}/:accountId/doctors/:doctorId`, doctors)

  app(req, res);

}
