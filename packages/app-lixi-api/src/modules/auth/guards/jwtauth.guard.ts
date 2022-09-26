import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const ctx = context.switchToHttp();
      const req = ctx.getRequest();

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
