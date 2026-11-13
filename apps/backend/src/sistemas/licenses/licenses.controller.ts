import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { LicensesService } from './licenses.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Sistemas — Licencias')
@Controller({ path: 'sistemas/licenses', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LicensesController {
  constructor(private licensesService: LicensesService) {}

  @Get('expiring')
  @ApiOperation({ summary: 'Licencias que vencen en los próximos N días (default 30)' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  findExpiringSoon(@Query('days') days?: string) {
    return this.licensesService.findExpiringSoon(days ? Number(days) : 30);
  }

  @Get('tech-asset/:techAssetId')
  @ApiOperation({ summary: 'Licencias de un equipo TIC' })
  findByTechAsset(@Param('techAssetId') techAssetId: string) {
    return this.licensesService.findByTechAsset(techAssetId);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_TIC, Role.TECNICO_SISTEMAS)
  @ApiOperation({ summary: 'Registrar licencia de software' })
  create(@Body() dto: CreateLicenseDto, @CurrentUser() user: any) {
    return this.licensesService.create(dto, user.id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_TIC, Role.TECNICO_SISTEMAS)
  @ApiOperation({ summary: 'Actualizar licencia' })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateLicenseDto>,
    @CurrentUser() user: any,
  ) {
    return this.licensesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_TIC)
  @ApiOperation({ summary: 'Eliminar licencia' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.licensesService.remove(id, user.id);
  }
}
