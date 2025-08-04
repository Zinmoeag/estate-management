import dotenv from 'dotenv';

import { JobWorker } from './worker';

class Bootstrap {
  private static _instance: Bootstrap;

  /**
   * service worker
   * register worker heres
   */
  private static workers = [JobWorker];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static async init() {
    if (!this._instance) {
      this._instance = new Bootstrap();

      dotenv.config();
      // initailize worker
      await Promise.all(this.workers.map((worker) => worker.run()));
    }
    return this._instance;
  }
}

export default Bootstrap;
