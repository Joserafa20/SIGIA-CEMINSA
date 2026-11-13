import {
  IsString, IsOptional, IsArray, ArrayNotEmpty, ValidateNested,
  IsNumber, IsPositive, IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StockEntryItemDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Número de lote del fabricante' })
  @IsString()
  lotNumber: string;

  @ApiPropertyOptional({ description: 'Fecha de vencimiento del lote (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({ description: 'Cantidad que ingresa' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({ description: 'Valor unitario' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  unitValue?: number;
}

export class CreateStockEntryDto {
  @ApiProperty({ description: 'ID de la sede que recibe el ingreso' })
  @IsString()
  sedeId: string;

  @ApiPropertyOptional({ description: 'Número de factura o documento de entrada' })
  @IsOptional()
  @IsString()
  documentRef?: string;

  @ApiPropertyOptional({ description: 'Proveedor o distribuidor' })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [StockEntryItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => StockEntryItemDto)
  items: StockEntryItemDto[];
}
