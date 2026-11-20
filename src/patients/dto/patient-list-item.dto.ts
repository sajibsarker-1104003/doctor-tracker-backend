import { ApiProperty } from '@nestjs/swagger';
import { PatientResponseDto } from './patient-response.dto.js';

class PatientDoctorDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() specialization!: string;
}

export class PatientListItemDto extends PatientResponseDto {
  @ApiProperty({ type: PatientDoctorDto })
  doctor!: PatientDoctorDto;
}