import type { NextApiRequest, NextApiResponse } from "next/types";
import accounts from './_accounts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await accounts(req, res);
}
