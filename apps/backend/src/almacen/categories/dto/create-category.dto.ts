import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssetType } from '@prisma/client';

export class CreateCategoryDto {
  @ApiProperty({ example: 'CEM-003' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Equipos Médicos' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: AssetType })
  @IsEnum(AssetType)
  assetType: AssetType;
}
