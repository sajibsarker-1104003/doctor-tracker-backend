import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import {
  IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min,
} from 'class-validator';
import { ToLowerCase, Trim } from '../../common/decorators/transform.decorators.js';

export class CreatePatientDto {
  @ApiProperty({ example: 'Rafi Ahmed' })
  @IsString() @IsNotEmpty() @MaxLength(100) @Trim()
  name!: string;

  @ApiProperty({ example: 32, minimum: 0, maximum: 120 })
  @IsInt() @Min(0) @Max(120)
  age!: number;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender!: Gender;

  @ApiProperty({ example: '+8801712345678' })
  @IsString() @Matches(/^\+?[0-9\s-]{7,15}$/, { message: 'phone must be a valid phone number' }) @Trim()
  phone!: string;

  @ApiPropertyOptional({ example: 'rafi@example.com' })
  @IsOptional() @IsEmail() @ToLowerCase()
  email?: string;

  @ApiProperty({ example: 'Hypertension' })
  @IsString() @IsNotEmpty() @MaxLength(100) @Trim()
  condition!: string;

  @ApiPropertyOptional({ example: 'Needs follow-up in 2 weeks' })
  @IsOptional() @IsString() @MaxLength(500) @Trim()
  notes?: string;
}