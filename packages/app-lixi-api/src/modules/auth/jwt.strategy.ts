import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { xor } from 'lodash';
import { Request as RequestType } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.LIXI_OAUTH2_URL}/.well-known/jwks`
      }),

      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWT, ExtractJwt.fromAuthHeaderAsBearerToken()])
    });
  }

  private static extractJWT(req: RequestType): string | null {
    if (req.cookies && 'access_token' in req.cookies && req.cookies.access_token.length > 0) {
      return req.cookies.access_token;
    }

    return null;
  }

  async validate(payload: any) {
    // if (xor(payload.scope.split(' '), ['openid', 'profile', 'email']).length > 0) {
    //   throw new UnauthorizedException('JWT does not possess the requires scope (`openid profile email`).');
    // }
    return payload;
  }
}
