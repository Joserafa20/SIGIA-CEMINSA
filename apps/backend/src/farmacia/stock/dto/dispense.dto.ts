import { IsString, IsOptional, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DispenseDto {
  @ApiProperty({ description: 'ID del producto a dispensar' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'ID de la sede desde donde se dispensa' })
  @IsString()
  sedeId: string;

  @ApiProperty({ description: 'Cantidad a dispensar (FEFO: se consume del lote más próximo a vencer)' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({ description: 'Número de orden o documento de solicitud' })
  @IsOptional()
  @IsString()
  documentRef?: string;

  @ApiPropertyOptional({ description: 'ID del usuario que autoriza la dispensación' })
  @IsOptional()
  @IsString()
  authorizedById?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
