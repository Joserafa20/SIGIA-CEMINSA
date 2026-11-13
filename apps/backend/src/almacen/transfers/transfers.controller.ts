import {
  Body, Controller, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Almacén — Traslados')
@Controller({ path: 'almacen/transfers', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TransfersController {
  constructor(private transfersService: TransfersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar traslados (filtrable por sede)' })
  @ApiQuery({ name: 'sedeId', required: false })
  findAll(@Query('sedeId') sedeId?: string) {
    return this.transfersService.findAll(sedeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un traslado' })
  findOne(@Param('id') id: string) {
    return this.transfersService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ALMACENISTA)
  @ApiOperation({ summary: 'Crear traslado (despacha activos)' })
  create(@Body() dto: CreateTransferDto, @CurrentUser() user: any) {
    return this.transfersService.create(dto, user.id);
  }

  @Patch(':id/advance')
  @Roles(Role.SUPER_ADMIN, Role.ALMACENISTA)
  @ApiOperation({ summary: 'Avanzar estado del traslado (DESPACHADO → EN_TRANSITO → RECIBIDO)' })
  advance(@Param('id') id: string, @CurrentUser() user: any) {
    return this.transfersService.advanceStatus(id, user.id);
  }

  @Patch(':id/cancel')
  @Roles(Role.SUPER_ADMIN, Role.ALMACENISTA)
  @ApiOperation({ summary: 'Cancelar traslado (solo si no ha sido recibido)' })
  cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ) {
    return this.transfersService.cancel(id, reason, user.id);
  }
}
