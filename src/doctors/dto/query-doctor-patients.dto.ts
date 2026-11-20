import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../common/decorators/transform.decorators.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class QueryDoctorPatientsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name, phone or email' })
  @IsOptional() @IsString() @MaxLength(100) @Trim()
  search?: string;

  @ApiPropertyOptional({ example: 'Diabetes' })
  @IsOptional() @IsString()
  condition?: string;

  @ApiPropertyOptional({ example: '2026-10-01' })
  @IsOptional() @IsISO8601()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-11-20' })
  @IsOptional() @IsISO8601()
  dateTo?: string;
}