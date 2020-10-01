import Express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import * as os from 'os';
import cookieParser from 'cookie-parser';
import isAdmin from '../api/middlewares/isAdmin';
import user from '../models/user';
import oas from './oas';

import l from './logger';
import mongo from './mongo';

const app = new Express();
const exit = process.exit;

export default class ExpressServer {
  constructor() {
    const root = path.normalize(`${__dirname}/../..`);
    app.set('appPath', `${root}client`);
    app.use(bodyParser.json({ limit: process.env.REQUEST_LIMIT || '1mb' }));
    app.use(
      bodyParser.urlencoded({
        extended: true,
        limit: process.env.REQUEST_LIMIT || '100kb',
      })
    );
    app.use(bodyParser.text({ limit: process.env.REQUEST_LIMIT || '100kb' }));
    app.use(cookieParser(process.env.SESSION_SECRET));
    app.use(Express.static(`${root}/public`));
    app.post('/addAdmin', isAdmin, (req, res) => {
      const { id, name } = req.body;
      var newAdmin = new user();
      newAdmin._id = id;
      newAdmin.name = name;
      newAdmin.role = 'admin';
      newAdmin.save((err, admin) => {
        if (err) {
          res.json('error in adding admin');
          console.log(err);
        } else {
          console.log(admin);
          res.json('admin added');
        }
      });
    });
  }

  router(routes) {
    this.routes = routes;
    return this;
  }

  listen(port = process.env.PORT) {
    const welcome = (p) => () =>
      l.info(
        `up and running in ${
          process.env.NODE_ENV || 'development'
        } @: ${os.hostname()} on port: ${p}}`
      );

    oas(app, this.routes)
      .then(() => {
        mongo().then(() => {
          l.info(`Database loaded!`);
          http.createServer(app).listen(port, welcome(port));
        });
      })
      .catch((e) => {
        l.error(e);
        exit(1);
      });

    return app;
  }
}
