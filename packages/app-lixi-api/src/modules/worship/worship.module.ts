import { Logger, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WorshipResolver } from './worship.resolver';
import { WorshipGateway } from './worship.gateway';
import { MeiliService } from '../page/meili.service';

@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [WorshipGateway, WorshipResolver, Logger, MeiliService],
  exports: [WorshipGateway, WorshipResolver, Logger]
})
export class WorshipModule {}
