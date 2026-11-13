import {
  IsString, IsEnum, IsOptional, IsBoolean, IsInt, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCategory } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({ description: 'Código único del producto (CUM, INVIMA, interno)' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Principio activo' })
  @IsString()
  activePrinciple: string;

  @ApiPropertyOptional({ description: 'Nombre comercial' })
  @IsOptional()
  @IsString()
  commercialName?: string;

  @ApiPropertyOptional({ description: 'Forma farmacéutica (tableta, jarabe, ampolla…)' })
  @IsOptional()
  @IsString()
  pharmaceuticalForm?: string;

  @ApiPropertyOptional({ description: 'Presentación (caja x 10, frasco 500ml…)' })
  @IsOptional()
  @IsString()
  presentation?: string;

  @ApiPropertyOptional({ description: 'Concentración (500 mg, 250 mg/5 ml…)' })
  @IsOptional()
  @IsString()
  concentration?: string;

  @ApiProperty({ enum: ProductCategory })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiPropertyOptional({ description: 'Número de registro INVIMA' })
  @IsOptional()
  @IsString()
  invima?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  requiresLot?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  requiresColdChain?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isControlled?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isComodato?: boolean;

  @ApiPropertyOptional({ description: 'Stock mínimo de alerta', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minimumStock?: number;
}
