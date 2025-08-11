import { Router } from 'express';
import { NextFunction, Request, Response } from 'express';

import { AppError, errorKinds } from '@/utils/error-handling';

import authRouter from './authRouter';

const router = Router();
router.get('/healthCheck', async (req: Request, res: Response) => {
  res.sendStatus(200);
});

//register route
router.use('/auth', authRouter);

//404 handler
router.use((req: Request, res: Response, next: NextFunction) => {
  // send 404 error
  return next(AppError.new(errorKinds.notFound, 'Not Found'));
});

// eslint-disable-next-line no-unused-vars
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    res
      .status(err.getStatus())
      .json({
        message: err.message,
        payload: err.payload,
      })
      .end();
  }
});

export default router;
