import { Module } from '@nestjs/common';
import { TechAssetsModule } from './tech-assets/tech-assets.module';
import { LicensesModule } from './licenses/licenses.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [TechAssetsModule, LicensesModule, MaintenanceModule, TicketsModule],
  exports: [TechAssetsModule, TicketsModule],
})
export class SistemasModule {}
