import {
  Body, Controller, Get, Param, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { MovementsService } from './movements.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Almacén — Movimientos')
@Controller({ path: 'almacen/movements', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MovementsController {
  constructor(private movementsService: MovementsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ALMACENISTA)
  @ApiOperation({ summary: 'Registrar movimiento de activo' })
  create(@Body() dto: CreateMovementDto, @CurrentUser() user: any) {
    return this.movementsService.create(dto, user.id);
  }

  @Get('asset/:assetId')
  @ApiOperation({ summary: 'Historial de movimientos de un activo' })
  findByAsset(@Param('assetId') assetId: string) {
    return this.movementsService.findByAsset(assetId);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Movimientos recientes (con filtro opcional por sede)' })
  @ApiQuery({ name: 'sedeId', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findRecent(
    @Query('sedeId') sedeId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.movementsService.findRecent(sedeId, limit ? Number(limit) : 50);
  }
}
