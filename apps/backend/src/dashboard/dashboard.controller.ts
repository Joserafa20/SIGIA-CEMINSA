import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@Controller({ path: 'dashboard', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Resumen ejecutivo — todos los módulos' })
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('almacen')
  @ApiOperation({ summary: 'Estadísticas Almacén' })
  getAlmacen() {
    return this.dashboardService.getAlmacenStats();
  }

  @Get('farmacia')
  @ApiOperation({ summary: 'Estadísticas Farmacia' })
  getFarmacia() {
    return this.dashboardService.getFarmaciaStats();
  }

  @Get('farmacia/alerts')
  @ApiOperation({ summary: 'Alertas de lotes — vencimiento próximo y cuarentena' })
  getFarmaciaAlerts() {
    return this.dashboardService.getFarmaciaStockAlerts();
  }

  @Get('sistemas')
  @ApiOperation({ summary: 'Estadísticas Sistemas' })
  getSistemas() {
    return this.dashboardService.getSistemasStats();
  }

  @Get('almacen/timeline')
  @ApiOperation({ summary: 'Movimientos por día (últimos N días)' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getAlmacenTimeline(@Query('days') days?: number) {
    return this.dashboardService.getAlmacenTimeline(days ? Number(days) : 30);
  }
}
