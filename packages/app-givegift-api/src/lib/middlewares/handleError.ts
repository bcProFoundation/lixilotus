import { NextFunction, Request, Response } from 'express';
import VError from 'verror';
import logger from '../logger';


/**
 * Handle the error which is thrown from anywhere of the app.
 * Should be the middleware resides at the end of the express app.
 * @param error The Error object, should always be VError object
 * @param req The request object
 * @param res The response object
 * @param next The next function to pass to next middleware
 */
export function handleError(error: VError, req: Request, res: Response, next: NextFunction) {
  const info = VError.info(error);
  const status = info && info.status ? info.status : 500;
  // Logging

  logger.error(error);
  logger.error(JSON.stringify(info));
  let err = error;
  while (err && (err as any).cause) {
    err = (err as any).cause();
    logger.error(err);
  }
  res.status(status).json(error);
}