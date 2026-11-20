import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { IsEnum, IsIn, IsISO8601, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../common/decorators/transform.decorators.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class QueryPatientsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name, phone, email or condition' })
  @IsOptional() @IsString() @MaxLength(100) @Trim()
  search?: string;

  @ApiPropertyOptional({ example: 'Diabetes' })
  @IsOptional() @IsString()
  condition?: string;

  @ApiPropertyOptional({ description: 'Filter by doctor id' })
  @IsOptional() @IsMongoId()
  doctorId?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional() @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: '2026-10-01', description: 'Created on/after (ISO date)' })
  @IsOptional() @IsISO8601()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-11-20', description: 'Created on/before (ISO date)' })
  @IsOptional() @IsISO8601()
  dateTo?: string;

  @ApiPropertyOptional({ enum: ['createdAt', 'name', 'age'], default: 'createdAt' })
  @IsOptional() @IsIn(['createdAt', 'name', 'age'])
  sortBy: 'createdAt' | 'name' | 'age' = 'createdAt';
}