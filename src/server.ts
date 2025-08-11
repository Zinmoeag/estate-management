import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import passport from 'passport';

import AppConfig from './app/config/app.config';

import 'reflect-metadata';

dotenv.config();

import Bootstrap from '@/app/bootstrap';

import router from './routes';
Bootstrap.init();

// import '@/app/config/passport.config';

const port = AppConfig.getConfig('PORT');
const app = express();

app.use((req, res, next) => {
  console.log('--- Incoming Request Info ---');
  console.log('Host:', req.headers.host);
  console.log('X-Real-IP:', req.headers['x-real-ip']);
  console.log('X-Forwarded-For:', req.headers['x-forwarded-for']);
  console.log('Remote Address:', req.connection.remoteAddress);
  console.log('Handled by:', process.env.HOSTNAME ?? 'unknown'); // useful in container
  next();
});

app.use(passport.initialize());

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
app.use('/api', router);

app.listen(port, () => console.log(`Server is running on ${port}`));
