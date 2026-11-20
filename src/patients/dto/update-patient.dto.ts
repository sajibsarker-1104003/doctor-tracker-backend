import { PartialType } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto.js';

// Shob field optional, validation rule CreatePatientDto er moto i thake
export class UpdatePatientDto extends PartialType(CreatePatientDto) {}