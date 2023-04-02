import { Logger, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WorshipResolver } from './worship.resolver';
import { WorshipGateway } from './worship.gateway';
// import { LixiNftController } from './lixinft.controller';
// import { LixiNftService } from './lixinft.service';

@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [WorshipGateway, WorshipResolver, Logger],
  exports: [WorshipGateway, WorshipResolver, Logger]
})
export class WorshipModule {}
