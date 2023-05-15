import { Logger, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TempleResolver } from './temple.resolver';
import { MeiliService } from '../page/meili.service';

@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [TempleResolver, Logger, MeiliService],
  exports: [TempleResolver, Logger]
})
export class TempleModule {}
