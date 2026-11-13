import {
  Body, Controller, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { QueryAssetsDto } from './dto/query-assets.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Almacén — Activos')
@Controller({ path: 'almacen/assets', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar activos con filtros y paginación' })
  findAll(@Query() query: QueryAssetsDto) {
    return this.assetsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener activo con movimientos recientes' })
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Get(':id/kardex')
  @ApiOperation({ summary: 'Kardex completo del activo' })
  getKardex(@Param('id') id: string) {
    return this.assetsService.getKardex(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ALMACENISTA)
  @ApiOperation({ summary: 'Registrar nuevo activo' })
  create(@Body() dto: CreateAssetDto, @CurrentUser() user: any) {
    return this.assetsService.create(dto, user.id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ALMACENISTA)
  @ApiOperation({ summary: 'Actualizar datos del activo' })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAssetDto>,
    @CurrentUser() user: any,
  ) {
    return this.assetsService.update(id, dto, user.id);
  }

  @Patch(':id/baja')
  @Roles(Role.SUPER_ADMIN, Role.ALMACENISTA)
  @ApiOperation({ summary: 'Solicitar baja del activo' })
  requestBaja(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ) {
    return this.assetsService.requestBaja(id, reason, user.id);
  }
}
