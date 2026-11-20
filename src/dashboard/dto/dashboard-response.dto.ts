import { ApiProperty } from '@nestjs/swagger';

class GrowthDto {
  @ApiProperty({ example: 8, description: 'Created in the last 30 days' })
  last30Days!: number;

  @ApiProperty({ example: 14.3, nullable: true, description: 'vs the previous 30 days (null if no previous data)' })
  growthPercent!: number | null;
}

export class SummaryResponseDto {
  @ApiProperty({ example: 12 }) totalDoctors!: number;
  @ApiProperty({ example: 120 }) totalPatients!: number;
  @ApiProperty({ example: 10 }) avgPatientsPerDoctor!: number;
  @ApiProperty({ type: GrowthDto }) doctors!: GrowthDto;
  @ApiProperty({ type: GrowthDto }) patients!: GrowthDto;
}

export class PatientsPerDoctorDto {
  @ApiProperty() doctorId!: string;
  @ApiProperty() name!: string;
  @ApiProperty() specialization!: string;
  @ApiProperty({ example: 15 }) patientCount!: number;
}

class TimelinePointDto {
  @ApiProperty({ example: '2026-11-20', description: 'YYYY-MM-DD (day) or YYYY-MM (month)' })
  date!: string;
  @ApiProperty({ example: 4 }) patients!: number;
  @ApiProperty({ example: 1 }) doctors!: number;
}

export class TimelineResponseDto {
  @ApiProperty({ enum: ['day', 'month'] }) interval!: string;
  @ApiProperty({ example: '2026-10-22' }) from!: string;
  @ApiProperty({ example: '2026-11-20' }) to!: string;
  @ApiProperty({ type: [TimelinePointDto] }) data!: TimelinePointDto[];
}

export class ConditionStatDto {
  @ApiProperty({ example: 'Diabetes' }) condition!: string;
  @ApiProperty({ example: 18 }) count!: number;
}

export class SpecializationStatDto {
  @ApiProperty({ example: 'Cardiology' }) specialization!: string;
  @ApiProperty({ example: 3 }) count!: number;
}