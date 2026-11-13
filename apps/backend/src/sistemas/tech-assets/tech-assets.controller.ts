import {
  Body, Controller, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { TechAssetsService } from './tech-assets.service';
import { CreateTechAssetDto } from './dto/create-tech-asset.dto';
import { QueryTechAssetsDto } from './dto/query-tech-assets.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Sistemas — Equipos TIC')
@Controller({ path: 'sistemas/assets', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TechAssetsController {
  constructor(private techAssetsService: TechAssetsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar equipos TIC con filtros y paginación' })
  findAll(@Query() query: QueryTechAssetsDto) {
    return this.techAssetsService.findAll(query);
  }

  @Get('qr/:code')
  @ApiOperation({ summary: 'Buscar equipo por código QR' })
  findByQr(@Param('code') code: string) {
    return this.techAssetsService.findByQr(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de equipo TIC con licencias, mantenimientos y tickets' })
  findOne(@Param('id') id: string) {
    return this.techAssetsService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_TIC, Role.TECNICO_SISTEMAS)
  @ApiOperation({ summary: 'Registrar equipo TIC (vincula un activo existente)' })
  create(@Body() dto: CreateTechAssetDto, @CurrentUser() user: any) {
    return this.techAssetsService.create(dto, user.id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_TIC, Role.TECNICO_SISTEMAS)
  @ApiOperation({ summary: 'Actualizar datos técnicos o asignación del equipo' })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateTechAssetDto>,
    @CurrentUser() user: any,
  ) {
    return this.techAssetsService.update(id, dto, user.id);
  }
}
