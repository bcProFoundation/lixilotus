import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwtauth.guard';

@Module({
  imports: [
  ],
  controllers: [
    AuthController
  ],
  providers: [
    AuthService,
  ],
  exports: [
    AuthService
  ]
})
export class AuthModule { }
