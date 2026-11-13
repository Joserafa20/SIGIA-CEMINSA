import { Module } from '@nestjs/common';
import { LicensesService } from './licenses.service';
import { LicensesController } from './licenses.controller';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [LicensesService],
  controllers: [LicensesController],
  exports: [LicensesService],
})
export class LicensesModule {}
