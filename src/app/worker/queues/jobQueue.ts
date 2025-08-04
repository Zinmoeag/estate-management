import { Queue } from 'bullmq';

import { connection } from '../config';

const jobQueue = new Queue('job', { connection });

export default jobQueue;
