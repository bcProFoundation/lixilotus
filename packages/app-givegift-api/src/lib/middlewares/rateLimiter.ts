import express from 'express';
import config from 'config';
import logger from '../logger';

function isWhiteListed(whitelist: Array<string> = [], ip: string) {
  return whitelist.some(listItem => ip.startsWith(listItem));
}

export function RateLimiter(method: string, perSecond: number, perMinute: number, perHour: number) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const identifier = req.header('CF-Connecting-IP') || req.socket.remoteAddress || '';
      const rateLimiter = config.has('rateLimiter') && config.get('rateLimiter');
      const whitelist = rateLimiter && (rateLimiter as any).whitelist;
      const isDisabled = rateLimiter && (rateLimiter as any).disabled;
      if (isDisabled || isWhiteListed(whitelist, identifier)) {
        return next();
      }
      // @Todo: implment rate limit

      // let [perSecondResult, perMinuteResult, perHourResult] = await RateLimitStorage.incrementAndCheck(
      //   identifier,
      //   method
      // );
      // if (
      //   perSecondResult.value!.count > perSecond ||
      //   perMinuteResult.value!.count > perMinute ||
      //   perHourResult.value!.count > perHour
      // ) {
      //   return res.status(429).send('Rate Limited');
      // }
    } catch (err) {
      logger.error('Rate Limiter failed');
    }
    return next();
  };
}