import {
  Body, Controller, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Farmacia — Productos')
@Controller({ path: 'farmacia/products', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar productos con filtros y paginación' })
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get('expiring-lots')
  @ApiOperation({ summary: 'Lotes próximos a vencer (alerta FEFO)' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  findExpiringLots(@Query('days') days?: string) {
    return this.productsService.findExpiringLots(days ? Number(days) : 30);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle del producto con lotes disponibles y stock por sede' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.REGENTE_FARMACIA)
  @ApiOperation({ summary: 'Registrar producto' })
  create(@Body() dto: CreateProductDto, @CurrentUser() user: any) {
    return this.productsService.create(dto, user.id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.REGENTE_FARMACIA)
  @ApiOperation({ summary: 'Actualizar producto' })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateProductDto>,
    @CurrentUser() user: any,
  ) {
    return this.productsService.update(id, dto, user.id);
  }

  @Patch(':id/deactivate')
  @Roles(Role.SUPER_ADMIN, Role.REGENTE_FARMACIA)
  @ApiOperation({ summary: 'Desactivar producto' })
  deactivate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productsService.deactivate(id, user.id);
  }
}
