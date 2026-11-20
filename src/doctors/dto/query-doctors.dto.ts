import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../common/decorators/transform.decorators.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class QueryDoctorsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name, email, hospital or specialization' })
  @IsOptional() @IsString() @MaxLength(100) @Trim()
  search?: string;

  @ApiPropertyOptional({ example: 'Cardiology' })
  @IsOptional() @IsString()
  specialization?: string;

  @ApiPropertyOptional({ example: 'Square Hospital' })
  @IsOptional() @IsString()
  hospital?: string;

  @ApiPropertyOptional({ example: '2026-10-01', description: 'Created on/after (ISO date)' })
  @IsOptional() @IsISO8601()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-11-20', description: 'Created on/before (ISO date)' })
  @IsOptional() @IsISO8601()
  dateTo?: string;

  @ApiPropertyOptional({ enum: ['createdAt', 'name'], default: 'createdAt' })
  @IsOptional() @IsIn(['createdAt', 'name'])
  sortBy: 'createdAt' | 'name' = 'createdAt';
}