import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JWTOAuth2Guard extends AuthGuard('jwt') {}
