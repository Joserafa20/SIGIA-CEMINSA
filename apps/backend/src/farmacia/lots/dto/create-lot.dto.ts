import { IsString, IsOptional, IsDateString, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLotDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Número de lote del fabricante' })
  @IsString()
  lotNumber: string;

  @ApiPropertyOptional({ description: 'Fecha de vencimiento (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({ description: 'Cantidad inicial del lote' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number;
}
