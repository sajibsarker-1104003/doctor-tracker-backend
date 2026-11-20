import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsISO8601, IsOptional, Matches, Max, Min } from 'class-validator';

export class TimelineQueryDto {
  @ApiPropertyOptional({ enum: ['day', 'month'], default: 'day' })
  @IsOptional()
  @IsIn(['day', 'month'])
  interval: 'day' | 'month' = 'day';

  @ApiPropertyOptional({
    example: '2026-10-22',
    description: 'Start date (YYYY-MM-DD). Default: 30 days (day) or 12 months (month) ending at "to"',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'from must be in YYYY-MM-DD format' })
  @IsISO8601({ strict: true })
  from?: string;

  @ApiPropertyOptional({ example: '2026-11-20', description: 'End date (YYYY-MM-DD). Default: today' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'to must be in YYYY-MM-DD format' })
  @IsISO8601({ strict: true })
  to?: string;
}

export class LimitQueryDto {
  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}