import { ApiProperty } from '@nestjs/swagger';

export class DoctorResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() specialization!: string;
  @ApiProperty() hospital!: string;
  @ApiProperty() phone!: string;
  @ApiProperty() email!: string;
  @ApiProperty({ example: 12 }) patientCount!: number;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}