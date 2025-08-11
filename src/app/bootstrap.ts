import dotenv from 'dotenv';

import AppConfig, { Configs } from '@/app/config/app.config';
import customEnvironment from '@/app/config/env/custom-env';
import { AppError, catchError, errorKinds } from '@/utils/error-handling';

import { PassportConfig } from './config/passport/passport.config';
import { JobWorker } from './worker';
import Worker from './worker/workers/worker.interface';

class Bootstrap {
  private static _instance: Bootstrap;

  /**
   * service worker
   * register worker heres
   */
  private static workers: Worker[] = [JobWorker];

  private constructor() {
    // env load
    dotenv.config();
    // Register configuration
    const [error] = catchError(() =>
      AppConfig.register(
        Object.fromEntries(
          Object.entries(customEnvironment).map(([key, value]) => {
            // env load
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
    if (error) AppError.new(errorKinds.internalServerError, 'env load error');
  }

  static init() {
    if (!this._instance) {
      this._instance = new Bootstrap();

      // passport config
      PassportConfig.initialize();

      // initailize worker
      Promise.all(this.workers.map((worker) => worker.run()));
    }
    return this._instance;
  }
}

export default Bootstrap;
