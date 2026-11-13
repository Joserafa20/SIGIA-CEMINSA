import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Reportes')
@Controller({ path: 'reports', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('almacen/excel')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_TIC, Role.ALMACENISTA, Role.CONTROL_INTERNO, Role.CONTABILIDAD)
  @ApiOperation({ summary: 'Exportar inventario Almacén (Excel)' })
  async almacenExcel(@Res() res: Response) {
    const buffer = await this.reportsService.generateAlmacenExcel();
    const filename = `inventario-almacen-${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('farmacia/excel')
  @Roles(Role.SUPER_ADMIN, Role.REGENTE_FARMACIA, Role.CONTROL_INTERNO, Role.CONTABILIDAD)
  @ApiOperation({ summary: 'Exportar stock Farmacia (Excel) — incluye hoja de lotes por vencer' })
  async farmaciaExcel(@Res() res: Response) {
    const buffer = await this.reportsService.generateFarmaciaStockExcel();
    const filename = `stock-farmacia-${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('dashboard/pdf')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_TIC, Role.CONTROL_INTERNO)
  @ApiOperation({ summary: 'Informe de gestión ejecutivo (PDF)' })
  async dashboardPdf(@Res() res: Response) {
    const buffer = await this.reportsService.generateDashboardPdf();
    const filename = `informe-sigia-${new Date().toISOString().slice(0, 10)}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
