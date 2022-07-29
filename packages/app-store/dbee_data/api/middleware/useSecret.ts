import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

/**
 * authenticate from backend for private routes
 * bearer token in header
 */
const useSecret = async (req: Request, res: Response, next: () => void) => {
  const secret = req.header('authorization')?.split(' ')[1] || '';
  const isAuth = await bcrypt.compare(secret, process.env.DBEE_SECRET_HASH || '');
  if (!isAuth) {
    res.sendStatus(401);
    return;
  }

  next();
}

export default useSecret;
