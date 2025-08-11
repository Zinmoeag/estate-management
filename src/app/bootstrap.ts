import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express, { Application } from 'express';
import passport from 'passport';
import path from 'path';

import AppConfig, { Configs } from '@/app/config/app.config';
// import customEnvironment from '@/app/config/env/custom-env';
import { AppError, catchError, errorKinds } from '@/utils/error-handling';

import { PassportConfig } from './config/passport/passport.config';
import { JobWorker } from './worker';
import Worker from './worker/workers/worker.interface';

class Bootstrap {
  private static _instance: Bootstrap;
  private static workers: Worker[] = [JobWorker];
  get expressApp() {
    return this.app;
  }

  private app: Application;

  private constructor() {
    const customEnvironment = require('@/app/config/env/custom-env').default;
    const NODE_ENV = process.env.NODE_ENV ?? 'development';
    const envFile =
      NODE_ENV === 'production'
        ? '.env.production'
        : NODE_ENV === 'development'
        ? '.env.development'
        : '.env';

    dotenv.config({ path: path.resolve(__dirname, '..', envFile) });

    // Register configuration
    const [error] = catchError(() =>
      AppConfig.register(
        Object.fromEntries(
          Object.entries(customEnvironment).map(([key, value]) => {
            if (value === undefined) {
              throw AppError.new(
                errorKinds.internalServerError,
                `env load error: ${key} is undefined`
              );
            }
            return [key, String(value)];
          })
        ) as Configs
      )
    );

    if (error) {
      console.log('error ===>', error);
      throw AppError.new(errorKinds.internalServerError, 'env load error');
    }

    // Initialize Express app
    this.app = express();
  }

  static init() {
    if (!this._instance) {
      // Initialize Express app
      this._instance = new Bootstrap();
      // setup middlewares
      this._instance.configureApp();
      // start workers
      this._instance.startWorkers();
      // register routes
      this._instance.registerRoutes();
      // start server
      this._instance.startServer();
    }
    return this._instance;
  }

  registerRoutes() {
    const router = require('@/routes').default;
    this.app.use('/api', router);
  }

  private configureApp() {
    this.app.use((req, res, next) => {
      console.log('--- Incoming Request Info ---');
      console.log('Host:', req.headers.host);
      console.log('X-Real-IP:', req.headers['x-real-ip']);
      console.log('X-Forwarded-For:', req.headers['x-forwarded-for']);
      console.log('Remote Address:', req.connection.remoteAddress);
      console.log('Handled by:', process.env.HOSTNAME ?? 'unknown');
      next();
    });

    this.app.use(cookieParser());
    this.app.use(passport.initialize());
    PassportConfig.initialize();

    this.app.use(express.json());
    this.app.use(bodyParser.json());
    this.app.use(
      cors({
        credentials: true,
        origin: 'http://localhost:5173',
      })
    );
    this.app.use(cookieParser());
  }

  private startServer() {
    const port = AppConfig.getConfig('PORT');
    this.app.listen(port, () => {
      console.log(`🚀 Server is running on ${port}`);
    });
  }

  private startWorkers() {
    Promise.all(Bootstrap.workers.map((worker) => worker.run()));
  }
}

export default Bootstrap;
