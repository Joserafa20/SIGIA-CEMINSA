import { Module } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { MovementsController } from './movements.controller';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [MovementsService],
  controllers: [MovementsController],
  exports: [MovementsService],
})
export class MovementsModule {}
