import {
  IsString, IsEnum, IsNumber, IsOptional, IsPositive, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from '@prisma/client';

export class CreateMovementDto {
  @ApiProperty({ description: 'ID del activo' })
  @IsString()
  assetId: string;

  @ApiProperty({ enum: MovementType })
  @IsEnum(MovementType)
  movementType: MovementType;

  @ApiProperty({ description: 'Cantidad (generalmente 1 para activos únicos)', default: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({ description: 'Número de documento soporte (factura, acta, etc.)' })
  @IsOptional()
  @IsString()
  documentRef?: string;

  @ApiPropertyOptional({ description: 'Notas o justificación del movimiento' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'ID del usuario que autoriza (requerido para salidas y bajas)' })
  @IsOptional()
  @IsString()
  authorizedById?: string;

  @ApiPropertyOptional({ description: 'Nuevo valor del activo (para ajustes de valor)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  newValue?: number;
}
