import { Request, Response } from 'express';

const usePathParams = (req: Request, res: Response, next: () => void) => {
  if (!Array.isArray(req.query.args)) {
    return next();
  }

  req.query.args.forEach((arg, index) => {
    if (index === 2) {
      res.locals.accountId = arg;
    }

    if (index === 4) {
      res.locals.doctorId = arg;
    }
  });
  next();
}

export default usePathParams;
