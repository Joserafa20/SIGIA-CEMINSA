import {
  Body, Controller, Get, Param, Patch, Post, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { LotsService } from './lots.service';
import { CreateLotDto } from './dto/create-lot.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Farmacia — Lotes')
@Controller({ path: 'farmacia/lots', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LotsController {
  constructor(private lotsService: LotsService) {}

  @Get('product/:productId')
  @ApiOperation({ summary: 'Lotes de un producto' })
  findByProduct(@Param('productId') productId: string) {
    return this.lotsService.findByProduct(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un lote con historial de movimientos' })
  findOne(@Param('id') id: string) {
    return this.lotsService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.REGENTE_FARMACIA)
  @ApiOperation({ summary: 'Crear lote' })
  create(@Body() dto: CreateLotDto, @CurrentUser() user: any) {
    return this.lotsService.create(dto, user.id);
  }

  @Patch(':id/quarantine')
  @Roles(Role.SUPER_ADMIN, Role.REGENTE_FARMACIA)
  @ApiOperation({ summary: 'Poner lote en cuarentena' })
  quarantine(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ) {
    return this.lotsService.quarantine(id, reason, user.id);
  }

  @Patch(':id/release')
  @Roles(Role.SUPER_ADMIN, Role.REGENTE_FARMACIA)
  @ApiOperation({ summary: 'Liberar lote de cuarentena' })
  release(@Param('id') id: string, @CurrentUser() user: any) {
    return this.lotsService.releaseFromQuarantine(id, user.id);
  }

  @Post('mark-expired')
  @Roles(Role.SUPER_ADMIN, Role.REGENTE_FARMACIA)
  @ApiOperation({ summary: 'Marcar lotes vencidos (tarea de mantenimiento)' })
  markExpired() {
    return this.lotsService.markExpiredLots().then((count) => ({
      message: `${count} lotes marcados como VENCIDO`,
      count,
    }));
  }
}
