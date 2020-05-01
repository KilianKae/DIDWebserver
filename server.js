'use strict';
import express from 'express';
import config from './config';
import middelwares from './midelwares';
import auth from './routes/auth';
import admin from './routes/admin';
import instituitonA from './routes/instiutions/a';
import instituitonB from './routes/instiutions/b';

const app = express();

app.use(middelwares.logger);

app.listen(config.port, () =>
  console.log('Server started at http://localhost:' + config.port)
);

app.listen(config.port, config.ip, () =>
  console.log('Server started at ', config.ip, 'port:', config.port)
);

app.use('/institution/a', instituitonA);
app.use('/institution/b', instituitonB);

app.use('/institution', auth);
app.use('/institution', auth);

app.use('/admin', admin);
