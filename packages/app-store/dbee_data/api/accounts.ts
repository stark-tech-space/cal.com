import type { NextApiRequest, NextApiResponse } from "next/types";
import { runMiddleware } from "dbee_data/api/utils";
import cors from 'cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors());
  res.send('ok');
}
