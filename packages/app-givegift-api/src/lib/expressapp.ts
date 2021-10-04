import express from 'express';


const bodyParser = require('body-parser');
const compression = require('compression');

export class ExpressApp {
  app: express.Express;

  constructor() {
    this.app = express();
  }

  async start() {

    this.app.use(compression());

    const POST_LIMIT = 1024 * 100 /* Max POST 100 kb */;

    this.app.use(
      bodyParser.json({
        limit: POST_LIMIT
      })
    );
  }
}