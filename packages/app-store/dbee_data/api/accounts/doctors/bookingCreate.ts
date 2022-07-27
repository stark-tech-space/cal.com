import type { NextApiRequest, NextApiResponse } from "next/types";

import { Request, Response } from 'express';

export default async (req: Request, res: Response) => {

  res.send('booking create')
}
