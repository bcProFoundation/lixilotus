import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from 'config';
import Container from 'typedi';
import SlpWallet from '@abcpros/minimal-xpi-slp-wallet';
import * as Vault from './routes/vault';
import * as Redeem from './routes/redeem';

const bodyParser = require('body-parser');
const compression = require('compression');
const xpiRestUrl = config.has('xpiRestUrl') ? config.get('xpiRestUrl') : 'https://api.sendlotus.com/v4/'


export class ExpressApp {
  app: express.Express;

  constructor() {
    this.app = express();
  }

  public routes() {
    this.app.use('/api', Vault.router);
    this.app.use('/api', Redeem.router);

    this.app.get('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
      throw new Error("Hello error!");
    });
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

    this.app.use(cors());
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
  }
}