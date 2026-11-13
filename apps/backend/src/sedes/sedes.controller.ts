import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { SedesService } from './sedes.service';
import { CreateSedeDto } from './dto/create-sede.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Sedes')
@Controller({ path: 'sedes', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SedesController {
  constructor(private sedesService: SedesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las sedes' })
  findAll() {
    return this.sedesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener sede por ID' })
  findOne(@Param('id') id: string) {
    return this.sedesService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_TIC)
  @ApiOperation({ summary: 'Crear sede' })
  create(@Body() dto: CreateSedeDto) {
    return this.sedesService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_TIC)
  @ApiOperation({ summary: 'Actualizar sede' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateSedeDto>) {
    return this.sedesService.update(id, dto);
  }

  @Patch(':id/toggle-active')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Activar / desactivar sede' })
  toggleActive(@Param('id') id: string) {
    return this.sedesService.toggleActive(id);
  }
}
