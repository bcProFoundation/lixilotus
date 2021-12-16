import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from 'config';
import Container from 'typedi';
import SlpWallet from '@abcpros/minimal-xpi-slp-wallet';
import * as Vault from './routes/vault';
import * as Redeem from './routes/redeem';
import * as Healthcheck from './routes/healthcheck';
import { handleError } from './middlewares/handleError';

const bodyParser = require('body-parser');
const compression = require('compression');
const xpiRestUrl = config.has('xpiRestUrl') ? config.get('xpiRestUrl') : 'https://api.sendlotus.com/v4/'
const allowedOrigins = [
  'https://lixilotus.com',
  'https://www.sendlotus.com',
  'https://staging.sendlotus.com',
  'https://staging.lixilotus.com/',
  'https://dev.lixilotus.com'
];

export class ExpressApp {
  app: express.Express;

  constructor() {
    this.app = express();
  }

  public routes() {
    this.app.use('/api', Vault.router);
    this.app.use('/api', Redeem.router);
    this.app.use('/api', Healthcheck.router);
  }

  public DIProviders() {
    const ConstructedSlpWallet = new SlpWallet('', {
      restURL: xpiRestUrl,
      hdPath: "m/44'/10605'/0'/0/0"
    });
    Container.set('xpiWallet', ConstructedSlpWallet);
    Container.set('xpijs', ConstructedSlpWallet.bchjs);
  }

  async start() {
    this.app.use(
      process.env.NODE_ENV === 'development' ?
        cors() :
        cors({
          origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
              const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
              return callback(new Error(msg), false);
            }
            return callback(null, true);
          }
        }));
    this.app.use(helmet());
    this.app.use(compression());

    const POST_LIMIT = 1024 * 100 /* Max POST 100 kb */;

    this.app.use(
      bodyParser.json({
        limit: POST_LIMIT
      })
    );

    this.DIProviders();
    this.routes();

    this.app.use(handleError);
  }
}