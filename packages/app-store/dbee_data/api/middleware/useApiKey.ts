import { Request, Response } from 'express';
import findValidApiKey from "@calcom/ee/lib/api/findValidApiKey";

export default async function validKey(req: Request, res: Response, next: () => void) {

  const { apiKey } = req.query;

  if (!apiKey) {
    return res.status(401).json({ message: "No API key provided" });
  }

  const validKey = await findValidApiKey(apiKey as string);

  if (!validKey) {
    return res.status(401).json({ message: "API key not valid" });
  }

  req.query.userId = validKey.userId.toString()

  next();
}