import Express from "express";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as http from "http";
import * as os from "os";
import cookieParser from "cookie-parser";

import oas from "./oas";

import l from "./logger";
import mongo from "./mongo";

const app = new Express();
const exit = process.exit;

export default class ExpressServer {
  constructor() {
    const root = path.normalize(`${__dirname}/../..`);
    app.set("appPath", `${root}client`);
    app.use(bodyParser.json({ limit: process.env.REQUEST_LIMIT || "1mb" }));
    app.use(
      bodyParser.urlencoded({
        extended: true,
        limit: process.env.REQUEST_LIMIT || "100kb",
      })
    );
    app.use(bodyParser.text({ limit: process.env.REQUEST_LIMIT || "100kb" }));
    app.use(cookieParser(process.env.SESSION_SECRET));
    app.use(Express.static(`${root}/public`));
  }

  router(routes) {
    this.routes = routes;
    return this;
  }

  async listen(port = process.env.PORT) {
    const welcome = (p) => () =>
      l.info(
        `up and running in ${process.env.NODE_ENV ||
          "development"} @: ${os.hostname()} on port: ${p}}`
      );

    try {
      await oas(app, this.routes);
      await mongo();
      l.info(`Database loaded!`);
      http.createServer(app).listen(port, welcome(port));
    } catch (err) {
      l.error(err);
      exit(1);
    }
    
    return app;
  }
}
