import {
  Body, Controller, Get, Param, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { StockService } from './stock.service';
import { CreateStockEntryDto } from './dto/stock-entry.dto';
import { DispenseDto } from './dto/dispense.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Farmacia — Stock')
@Controller({ path: 'farmacia/stock', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StockController {
  constructor(private stockService: StockService) {}

  @Get('sede/:sedeId')
  @ApiOperation({ summary: 'Stock actual de todos los productos en una sede' })
  getStockBySede(@Param('sedeId') sedeId: string) {
    return this.stockService.getStockBySede(sedeId);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Historial de movimientos de stock' })
  @ApiQuery({ name: 'sedeId', required: false })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMovements(
    @Query('sedeId') sedeId?: string,
    @Query('productId') productId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.stockService.getMovements({ sedeId, productId, page, limit });
  }

  @Post('entry')
  @Roles(Role.SUPER_ADMIN, Role.REGENTE_FARMACIA)
  @ApiOperation({ summary: 'Registrar ingreso de stock (múltiples ítems, crea/actualiza lotes)' })
  createEntry(@Body() dto: CreateStockEntryDto, @CurrentUser() user: any) {
    return this.stockService.createEntry(dto, user.id);
  }

  @Post('dispense')
  @Roles(Role.SUPER_ADMIN, Role.REGENTE_FARMACIA)
  @ApiOperation({ summary: 'Dispensar medicamento (FEFO — consume lotes por fecha de vencimiento ASC)' })
  dispense(@Body() dto: DispenseDto, @CurrentUser() user: any) {
    return this.stockService.dispense(dto, user.id);
  }

  @Post('adjust')
  @Roles(Role.SUPER_ADMIN, Role.REGENTE_FARMACIA)
  @ApiOperation({ summary: 'Ajuste de inventario en un lote específico' })
  adjust(
    @Body() body: {
      productId: string;
      lotId: string;
      sedeId: string;
      newQuantity: number;
      reason: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.stockService.adjust({ ...body, userId: user.id });
  }
}
