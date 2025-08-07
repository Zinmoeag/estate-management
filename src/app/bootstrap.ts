import dotenv from 'dotenv';

import AppConfig, { Configs } from '@/config/env/app-config';
import customEnvironment from '@/config/env/custom-env';

import { JobWorker } from './worker';
import Worker from './worker/workers/worker.interface';

class Bootstrap {
  private static _instance: Bootstrap;

  /**
   * service worker
   * register worker heres
   */
  private static workers: Worker[] = [JobWorker];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static async init() {
    if (!this._instance) {
      this._instance = new Bootstrap();

      dotenv.config();

      // Register configuration
      AppConfig.register(
        Object.fromEntries(
          Object.entries(customEnvironment).map(([key, value]) => [
            key,
            value !== undefined ? String(value) : value,
          ])
        ) as Configs
      );

      // initailize worker
      await Promise.all(this.workers.map((worker) => worker.run()));
    }
    return this._instance;
  }
}

export default Bootstrap;
