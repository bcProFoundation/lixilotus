import { Global, Module, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService, Logger],
  exports: [PrismaService]
})
export class PrismaModule {}
