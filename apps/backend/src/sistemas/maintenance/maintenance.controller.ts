import {
  Body, Controller, Get, Param, Patch, Post, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto, UpdateMaintenanceDto } from './dto/create-maintenance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Sistemas — Mantenimientos')
@Controller({ path: 'sistemas/maintenance', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  @Get('scheduled')
  @ApiOperation({ summary: 'Mantenimientos programados pendientes' })
  findScheduled() {
    return this.maintenanceService.findScheduled();
  }

  @Get('tech-asset/:techAssetId')
  @ApiOperation({ summary: 'Historial de mantenimientos de un equipo' })
  findByTechAsset(@Param('techAssetId') techAssetId: string) {
    return this.maintenanceService.findByTechAsset(techAssetId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un mantenimiento' })
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_TIC, Role.TECNICO_SISTEMAS)
  @ApiOperation({ summary: 'Programar mantenimiento' })
  create(@Body() dto: CreateMaintenanceDto, @CurrentUser() user: any) {
    return this.maintenanceService.create(dto, user.id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_TIC, Role.TECNICO_SISTEMAS)
  @ApiOperation({ summary: 'Actualizar estado o resultados del mantenimiento' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMaintenanceDto,
    @CurrentUser() user: any,
  ) {
    return this.maintenanceService.update(id, dto, user.id);
  }
}
