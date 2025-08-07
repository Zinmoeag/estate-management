import * as dotenv from 'dotenv';
dotenv.config();

import Bootstrap from '@/app/bootstrap';
Bootstrap.init();

import '@/config/passport.config';
import 'reflect-metadata';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import passport from 'passport';

import jobQueue from '@/app/worker/queues/jobQueue';
import AppConfig from '@/config/env/app-config';
import router from '@/routes/index';

const app = express();
const port = AppConfig.getConfig('PORT');

app.use((req, res, next) => {
  console.log('--- Incoming Request Info ---');
  console.log('Host:', req.headers.host);
  console.log('X-Real-IP:', req.headers['x-real-ip']);
  console.log('X-Forwarded-For:', req.headers['x-forwarded-for']);
  console.log('Remote Address:', req.connection.remoteAddress);
  console.log('Handled by:', process.env.HOSTNAME ?? 'unknown'); // useful in container
  next();
});

app.get('/healthcheck', async (req, res) => {
  await jobQueue.add('generatePDF', { hello: 'world' });
  res.sendStatus(200);
});

app.use(passport.initialize());
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
app.use('/api', router);

app.listen(port, () => console.log(`Server is running on ${port}`));
