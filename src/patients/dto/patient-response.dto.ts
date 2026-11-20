import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class PatientResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() age!: number;
  @ApiProperty({ enum: Gender }) gender!: Gender;
  @ApiProperty() phone!: string;
  @ApiPropertyOptional({ nullable: true }) email?: string | null;
  @ApiProperty() condition!: string;
  @ApiPropertyOptional({ nullable: true }) notes?: string | null;
  @ApiProperty() doctorId!: string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}