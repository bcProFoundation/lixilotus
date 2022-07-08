import { Logger } from '@nestjs/common';
import express from 'express';

type TimedRequest = {
  startTime?: Date;
} & express.Request;

const logger: Logger = new Logger('MiddleWare');

function LogObj(logOut: { [key: string]: string }) {
  logger.log(
    `${logOut.time} | ${logOut.ip} | ${logOut.phase} | ${logOut.took} | ${logOut.method} | ${logOut.status} | ${logOut.url} | ${logOut.openConnections} open`
  );
}

let openConnections = 0;

function LogPhase(req: TimedRequest, res: express.Response, phase: string) {
  const ip = req.header('CF-Connecting-IP') || req.socket.remoteAddress || req.hostname;
  const logOut = {
    time: req.startTime ? req.startTime.toTimeString() : new Date().toTimeString(),
    ip: ip.padStart(22, ' '),
    phase: phase.padStart(8, ' '),
    method: req.method.padStart(6, ' '),
    status: '...'.padStart(5, ' '),
    url: `${req.baseUrl}${req.url}`,
    took: '...'.padStart(10, ' '),
    openConnections: openConnections.toString().padStart(6, ' ')
  };
  if (req.startTime && ['END', 'CLOSED'].includes(phase)) {
    const endTime = new Date();
    const startTime = req.startTime ? req.startTime : endTime;
    const totalTime = endTime.getTime() - startTime.getTime();
    const totalTimeMsg = `${totalTime} ms`.padStart(10, ' ');
    logOut.took = totalTimeMsg.padStart(10, ' ');
    logOut.status = res.statusCode.toString().padStart(5, ' ');
  }
  LogObj(logOut);
}

export function LogMiddleware() {
  return (req: TimedRequest, res: express.Response, next: express.NextFunction) => {
    req.startTime = new Date();
    openConnections++;
    LogPhase(req, res, 'START');
    res.on('finish', () => {
      openConnections--;
      LogPhase(req, res, 'END');
    });
    res.on('close', () => {
      openConnections--;
      LogPhase(req, res, 'CLOSED');
    });
    next();
  };
}
