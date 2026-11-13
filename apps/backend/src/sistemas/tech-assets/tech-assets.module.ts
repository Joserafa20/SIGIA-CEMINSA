import { Module } from '@nestjs/common';
import { TechAssetsService } from './tech-assets.service';
import { TechAssetsController } from './tech-assets.controller';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [TechAssetsService],
  controllers: [TechAssetsController],
  exports: [TechAssetsService],
})
export class TechAssetsModule {}
