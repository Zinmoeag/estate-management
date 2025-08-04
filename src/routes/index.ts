import { Router } from 'express';
import { NextFunction, Request, Response } from 'express';
import { AppError, errorKinds } from 'utils/error-handling';

import agentRouter from './agentRouter';
import authRouter from './authRouter';
import ownerRouter from './ownerRouter';
import postRouter from './postRouter';
import userRouter from './userRouter';

const router = Router();
router.get('/healthCheck', async (req: Request, res: Response) => {
  res.sendStatus(200);
});

//register route

router.use('/owners', ownerRouter);
router.use('/users', userRouter);
router.use('/auth', authRouter);
router.use('/agent-profiles', agentRouter);
router.use('/posts', postRouter);

//404 handler
router.use((req: Request, res: Response, next: NextFunction) => {
  // send 404 error
  return next(AppError.new(errorKinds.notFound, 'Not Found'));
  // send 404 error
});

// error handling

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

// import { createClient } from 'redis';

// const client = createClient({
//     username: 'default',
//     password: 'KU3ZXMOeBwQ62GqEWAL12vdjOHJO3oD6',
//     socket: {
//         host: 'redis-10062.c81.us-east-1-2.ec2.redns.redis-cloud.com',
//         port: 10062
//     }
// });

// client.on('error', err => console.log('Redis Client Error', err));

// await client.connect();

// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar
