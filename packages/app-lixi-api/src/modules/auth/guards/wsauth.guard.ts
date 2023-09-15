import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class WsAuthGuardByPass implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const client = context.switchToWs().getClient<Socket>();
      const cookies = client.handshake.headers.cookie?.split('; ');
      const authCookie = cookies?.find(cookie => cookie.startsWith('_auth_token'));
      const token = authCookie?.split('=')[1];

      return new Promise(async (resolve, reject) => {
        try {
          if (!token) resolve(true);
          const account = await this.authService.verifyJwt(token!);
          client.data.account = account;
          if (!account) {
            return resolve(true);
          }
          resolve(true);
        } catch (err) {
          resolve(true);
        }
      });
    } catch (e) {
      return true;
    }
  }
}
