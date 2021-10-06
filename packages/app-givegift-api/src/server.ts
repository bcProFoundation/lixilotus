import { ExpressApp } from "./lib/expressapp";
import config from 'config';
import http from 'http';
import https, { ServerOptions } from 'https';
import logger from "./lib/logger";

const serverOpts: ServerOptions = {};

const expressApp = new ExpressApp();
const isHttps = config.has('https') && config.get('https')

async function startInstance() {

  const server = isHttps
    ? https.createServer(serverOpts, expressApp.app)
    : http.createServer(expressApp.app);
  const port: number = config.get('port') || 4343;

  await expressApp.start();
  server.listen(port, () => {
    logger.info(`Server givegift-api is running at port ${port}`);
  });
}

startInstance();


