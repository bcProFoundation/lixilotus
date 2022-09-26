import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../auth.service';

@Injectable()
export class GqlJwtAuthGuard implements CanActivate {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const ctx = GqlExecutionContext.create(context);
      const req = ctx.getContext().req;

      const token = req.cookies['_auth_token'];

      return new Promise(async (resolve, reject) => {
        try {
          const account = await this.authService.verifyJwt(token);
          if (!account) {
            return resolve(false);
          }
          req.account = account;
          resolve(true);
        } catch (err) {
          resolve(false);
        }
      });
    } catch (e) {
      return false;
    }
  }
}
