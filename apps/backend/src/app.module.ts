import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuditModule } from './common/audit/audit.module';
import { SedesModule } from './sedes/sedes.module';
import { AlmacenModule } from './almacen/almacen.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuditModule,
    AuthModule,
    UsersModule,
    SedesModule,
    AlmacenModule,
  ],
})
export class AppModule {}
