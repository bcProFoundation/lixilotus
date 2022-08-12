import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Observable } from 'rxjs';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private adapterHost: HttpAdapterHost) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const httpAdapter = this.adapterHost.httpAdapter as FastifyAdapter;
      const instance = httpAdapter.getInstance();
      const ctx = context.switchToHttp();
      const req = ctx.getRequest();
      const res = ctx.getResponse();
      const next = ctx.getNext();

      instance.csrfProtection(req, res, () => {});

      return true;
    } catch (e) {
      return false;
    }
  }
}
