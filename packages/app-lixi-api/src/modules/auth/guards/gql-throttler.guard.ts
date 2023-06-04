import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlArgumentsHost, GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard, ThrottlerModuleOptions, ThrottlerStorage } from '@nestjs/throttler';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  private logger: Logger = new Logger(GqlThrottlerGuard.name);

  constructor(options: ThrottlerModuleOptions, storageService: ThrottlerStorage, reflector: Reflector) {
    super(options, storageService, reflector);
  }

  protected getTracker(req: Record<string, any>): string {
    this.logger.log('getTracker');
    this.logger.log(req.ip);
    return req.ips && req.ips.length ? req.ips[0] : req.ip; // individualize IP extraction to meet your own needs
  }

  protected async handleRequest(context: ExecutionContext, limit: number, ttl: number): Promise<boolean> {
    // Here we start to check the amount of requests being done against the ttl.
    const { req, res } = this.getRequestResponse(context);

    // Return early if the current user agent should be ignored.
    if (Array.isArray(this.options.ignoreUserAgents)) {
      for (const pattern of this.options.ignoreUserAgents) {
        if (pattern.test(req.headers['user-agent'])) {
          return true;
        }
      }
    }
    const tracker = this.getTracker(req);
    const key = this.generateKey(context, tracker);
    const { totalHits, timeToExpire } = await this.storageService.increment(key, ttl);

    // Throw an error when the user reached their limit.
    if (totalHits > limit) {
      res.header('Retry-After', timeToExpire);
      this.throwThrottlingException(context);
    }

    res.header(`${this.headerPrefix}-Limit`, limit);
    // We're about to add a record so we need to take that into account here.
    // Otherwise the header says we have a request left when there are none.
    res.header(`${this.headerPrefix}-Remaining`, Math.max(0, limit - totalHits));
    res.header(`${this.headerPrefix}-Reset`, timeToExpire);

    return true;
  }

  getRequestResponse(context: ExecutionContext) {
    this.logger.log('getRequestResponse');
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();
    return { req: ctx.req, res: ctx.reply }; // ctx.request and ctx.reply for fastify
  }
}
