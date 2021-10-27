import 'reflect-metadata';
import { ExpressApp } from "./lib/expressapp";
import config from 'config';
import http from 'http';
import https, { ServerOptions } from 'https';
import logger from "./lib/logger";
import fs from 'fs';
import path from 'path';

let serverOpts: ServerOptions = {};
try {
  serverOpts = {
    key: fs.readFileSync(path.resolve(__dirname, '../.cert/key.pem')),
    cert: fs.readFileSync(path.resolve(__dirname, '../.cert/cert.pem')),
  };
} catch (err) {
}


const expressApp = new ExpressApp();
const isHttps = config.has('https') && config.get('https') && serverOpts.key !== undefined;

async function startInstance() {

  const server = isHttps
    ? https.createServer({}, expressApp.app)
    : http.createServer(expressApp.app);
  const port: number = config.get('port') || 4343;

  await expressApp.start();
  server.listen(port, () => {
    logger.info(`Server givegift-api is running at port ${port}`);
  });
}

startInstance();


