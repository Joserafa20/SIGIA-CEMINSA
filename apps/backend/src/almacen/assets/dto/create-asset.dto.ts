import {
  IsString, IsOptional, IsEnum, IsNumber, IsDateString,
  IsPositive, Min, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssetStatus } from '@prisma/client';

export class CreateAssetDto {
  @ApiProperty({ example: 'Aire acondicionado' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'CIAC' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: '24000 BTU' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ description: 'Número de serie' })
  @IsOptional()
  @IsString()
  serial?: string;

  @ApiPropertyOptional({ description: 'Registro INVIMA si aplica' })
  @IsOptional()
  @IsString()
  invima?: string;

  @ApiPropertyOptional({ description: 'Placa o código institucional asignado' })
  @IsOptional()
  @IsString()
  plaque?: string;

  @ApiPropertyOptional({ description: 'Código institucional (ej. CEM-028)' })
  @IsOptional()
  @IsString()
  institutionalCode?: string;

  @ApiProperty({ description: 'ID de la categoría del activo' })
  @IsString()
  categoryId: string;

  @ApiProperty({ description: 'ID de la sede donde se ubica el activo' })
  @IsString()
  sedeId: string;

  @ApiPropertyOptional({ enum: AssetStatus, default: AssetStatus.BUENO })
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @ApiPropertyOptional({ description: 'Valor de adquisición en pesos' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  initialValue?: number;

  @ApiPropertyOptional({ description: 'Fecha de adquisición (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  acquisitionDate?: string;

  @ApiPropertyOptional({ description: 'Vida útil estimada en años' })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  usefulLifeYears?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observations?: string;
}
