import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuditModule } from './common/audit/audit.module';
import { SedesModule } from './sedes/sedes.module';
import { AlmacenModule } from './almacen/almacen.module';
import { SistemasModule } from './sistemas/sistemas.module';
import { FarmaciaModule } from './farmacia/farmacia.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuditModule,
    AuthModule,
    UsersModule,
    SedesModule,
    AlmacenModule,
    SistemasModule,
    FarmaciaModule,
    DashboardModule,
    ReportsModule,
  ],
})
export class AppModule {}
