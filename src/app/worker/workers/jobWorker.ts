import { Job, Worker } from 'bullmq';
import { readdir, readdirSync } from 'fs';
import { join } from 'path';

import { connection } from '../config';
import IJob from '../config/job.interface';

const registeredJobsFolderName = 'jobs';
const jobDir = join(__dirname, `../${registeredJobsFolderName}`);

export class JobWorker {
  private static _instance: JobWorker;
  private commandsName = readdirSync(jobDir).map((file) => file.split('.')[0]);
  private jobParentName = 'job';
  private jobRegistry: Record<string, IJob> = {};
  private worker: Worker;

  constructor() {
    this.worker = new Worker(
      this.jobParentName,
      async (job) => this.jobDispatcher(job),
      {
        connection,
      }
    );

    this.worker.on('completed', (job) => {
      console.log(job.data, 'complete');
    });

    this.worker.on('failed', (job) => {
      console.log(job?.data, 'failed');
    });
  }

  static run() {
    if (!this._instance) {
      this._instance = new JobWorker();
      this._instance.registerAllJobCommands();
    }
    return this._instance;
  }

  private async jobDispatcher(job: Job) {
    try {
      // dispatch job to command
      const jobName = job.name;
      if (!jobName || !this.commandsName.includes(jobName)) {
        throw new Error('job not found');
      }
      if (this.jobRegistry[jobName])
        await this.jobRegistry[jobName].execute(job.data);
    } catch (err) {
      console.log(err);
    }
  }

  private async registerAllJobCommands() {
    try {
      await readdir(jobDir, (err, files) => {
        if (err) throw err;
        const jobRegistry: Record<string, IJob> = {};
        for (const file of files) {
          if (typeof file !== 'string') break;
          const fileNameParts = file.split('.');
          // remove extension
          const fileName = fileNameParts
            .slice(0, fileNameParts.length - 1)
            .join('.');

          if (!fileName.endsWith('.job')) break;

          // retrieve module and registered instantiated command
          const module = require(join(jobDir, file));
          const key = fileNameParts[0];

          const commandClass = module.default;
          // check valid export class
          if (!commandClass)
            throw new Error(`In ${key} command, class is not export`);
          if (
            typeof commandClass !== 'function' ||
            typeof commandClass.prototype.execute !== 'function'
          )
            throw new Error(
              `${key} must export a class with an 'execute' method`
            );
          jobRegistry[key] = new commandClass();
        }
        this.jobRegistry = jobRegistry;
      });
    } catch (err) {
      console.log(err);
    }
  }
}
