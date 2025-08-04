import { JobWorker } from './worker';

async function bootstrap() {
  /**
   * worker register
   */
  const workers = [JobWorker.run()];

  Promise.all(workers);
}

bootstrap();
