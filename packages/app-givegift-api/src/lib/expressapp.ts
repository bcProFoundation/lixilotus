import express from 'express';

const bodyParser = require('body-parser');
const compression = require('compression');
import * as Gift from './routes/gift';
import * as Giver from './routes/giver';
import * as Vault from './routes/vault';

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

    this.app.use('/api', Gift.router);
    this.app.use('/api', Giver.router);
    this.app.use('/api', Vault.router);
  }
}