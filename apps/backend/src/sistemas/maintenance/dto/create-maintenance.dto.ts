import {
  IsString, IsEnum, IsOptional, IsDateString, IsNumber, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaintenanceType } from '@prisma/client';

export class CreateMaintenanceDto {
  @ApiProperty()
  @IsString()
  techAssetId: string;

  @ApiProperty({ enum: MaintenanceType })
  @IsEnum(MaintenanceType)
  type: MaintenanceType;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'ID del técnico responsable' })
  @IsString()
  technicianId: string;

  @ApiPropertyOptional({ description: 'Fecha programada (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional({ description: 'Fecha de ejecución (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  executedDate?: string;

  @ApiPropertyOptional({ description: 'Próximo mantenimiento programado' })
  @IsOptional()
  @IsDateString()
  nextScheduled?: string;

  @ApiPropertyOptional({ description: 'Costo del mantenimiento' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({ description: 'Hallazgos durante el mantenimiento' })
  @IsOptional()
  @IsString()
  findings?: string;

  @ApiPropertyOptional({ description: 'Trabajo realizado' })
  @IsOptional()
  @IsString()
  workDone?: string;

  @ApiPropertyOptional({ description: 'Repuestos o partes utilizadas' })
  @IsOptional()
  @IsString()
  parts?: string;
}

export class UpdateMaintenanceDto {
  @ApiPropertyOptional({ description: 'Estado: PROGRAMADO | EN_EJECUCION | COMPLETADO | CANCELADO' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  executedDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  nextScheduled?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  findings?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workDone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parts?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cost?: number;
}
