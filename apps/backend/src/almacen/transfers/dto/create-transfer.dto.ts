import { IsString, IsArray, IsOptional, ArrayNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransferDto {
  @ApiProperty({ description: 'ID de la sede de origen' })
  @IsString()
  fromSedeId: string;

  @ApiProperty({ description: 'ID de la sede de destino' })
  @IsString()
  toSedeId: string;

  @ApiProperty({ description: 'IDs de activos a transferir', type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  assetIds: string[];

  @ApiPropertyOptional({ description: 'Número de acta o documento de traslado' })
  @IsOptional()
  @IsString()
  documentRef?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
