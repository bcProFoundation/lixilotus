import { Module } from '@nestjs/common';

import { AuthModule } from 'src/modules/auth/auth.module';
import { EmailTemplateController } from './email-template.controller';
import { EmailTemplateService } from './email-template.service';

@Module({
  imports: [AuthModule],
  exports: [EmailTemplateService],
  controllers: [EmailTemplateController],
  providers: [EmailTemplateService]
})
export class EmailTemplateModule { }
