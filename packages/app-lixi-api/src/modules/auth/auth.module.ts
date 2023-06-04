import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GqlThrottlerGuard } from './guards/gql-throttler.guard';
import { JwtStrategy } from './jwt.strategy';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ThrottlerModule.forRoot({
      limit: 30,
      ttl: 60
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GqlThrottlerGuard],
  exports: [AuthService, GqlThrottlerGuard]
})
export class AuthModule {}
