import { IsString, IsOptional, IsInt, IsPositive, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLicenseDto {
  @ApiProperty()
  @IsString()
  techAssetId: string;

  @ApiProperty({ description: 'Nombre del producto/software licenciado' })
  @IsString()
  productName: string;

  @ApiPropertyOptional({ description: 'Clave de licencia (almacenada como texto)' })
  @IsOptional()
  @IsString()
  licenseKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendor?: string;

  @ApiPropertyOptional({ description: 'Fecha de vencimiento (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Número de puestos/seats incluidos' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  seats?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
