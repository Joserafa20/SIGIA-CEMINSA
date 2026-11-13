import {
  IsString, IsOptional, IsInt, IsPositive, IsDateString, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTechAssetDto {
  @ApiProperty({ description: 'ID del activo base (Asset del módulo Almacén)' })
  @IsString()
  assetId: string;

  @ApiProperty({ description: 'ID de la sede donde reside el equipo' })
  @IsString()
  sedeId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  processor?: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  ramGb?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  storageGb?: number;

  @ApiPropertyOptional({ description: 'HDD, SSD, NVMe…' })
  @IsOptional()
  @IsString()
  storageType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  operatingSystem?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  osVersion?: string;

  @ApiPropertyOptional({ description: 'Dirección MAC de la NIC principal' })
  @IsOptional()
  @IsString()
  macAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Fecha de vencimiento de garantía (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  warrantyExpiry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  purchaseOrder?: string;

  @ApiPropertyOptional({ description: 'ID del usuario al que está asignado el equipo' })
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiPropertyOptional({ description: 'Ubicación física (oficina, piso, área)' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
