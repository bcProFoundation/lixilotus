import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { xor } from 'lodash';
import { Request as RequestType } from 'express';
// import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `http://accounts.localhost:3000/.well-known/jwks` // will change in the next commit
      }),

      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWT, ExtractJwt.fromAuthHeaderAsBearerToken()])
    });
  }

  private static extractJWT(req: RequestType): string | null {
    if (req.cookies && 'access_token' in req.cookies && req.cookies.access_token.length > 0) {
      console.log(req.cookies.access_token);
      return req.cookies.access_token;
    }

    return null;
  }

  async validate(payload: any) {
    console.log(payload);
    // if (xor(payload.scope.split(' '), ['openid', 'profile', 'email']).length > 0) {
    //   throw new UnauthorizedException('JWT does not possess the requires scope (`openid profile email`).');
    // }
    return payload;
  }
}
