import { Request, Response } from 'express';

const usePathParams = (req: Request, res: Response, next: () => void) => {
  console.log('req', {headers: req.headers, url: req.url, body: req.body, params: req.params});
  console.log('req.query', req.query);
  console.log('req.query.args', req.query.args);
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

  console.log('res.locals', res.locals);
  next();
}

export default usePathParams;
