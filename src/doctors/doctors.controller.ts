import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, Patch } from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ApiCommonErrors } from '../common/decorators/api-common-errors.decorator.js';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';
import { CreatePatientDto } from '../patients/dto/create-patient.dto.js';
import { PatientResponseDto } from '../patients/dto/patient-response.dto.js';
import { DoctorsService } from './doctors.service.js';
import { CreateDoctorDto } from './dto/create-doctor.dto.js';
import { DoctorResponseDto } from './dto/doctor-response.dto.js';
import { QueryDoctorPatientsDto } from './dto/query-doctor-patients.dto.js';
import { QueryDoctorsDto } from './dto/query-doctors.dto.js';

@ApiTags('Doctors')
@ApiBearerAuth()
@ApiCommonErrors()
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctors: DoctorsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a doctor (ADMIN)' })
  @ApiCreatedResponse({ type: DoctorResponseDto })
  create(@Body() dto: CreateDoctorDto) {
    return this.doctors.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List doctors with search, filters and pagination' })
  @ApiPaginatedResponse(DoctorResponseDto)
  findAll(@Query() query: QueryDoctorsDto) {
    return this.doctors.findAll(query);
  }

  @Get('filter-options')
  @ApiOperation({ summary: 'Distinct specializations and hospitals for filter dropdowns' })
  filterOptions() {
    return this.doctors.filterOptions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a doctor by id' })
  @ApiOkResponse({ type: DoctorResponseDto })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.doctors.findOne(id);
  }

  // NEW: Update Doctor
  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a doctor (ADMIN)' })
  @ApiOkResponse({ type: DoctorResponseDto })
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: Partial<CreateDoctorDto>) {
    return this.doctors.update(id, dto);
  }

  // NEW: Delete Doctor
  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a doctor (ADMIN)' })
  @ApiNoContentResponse({ description: 'Doctor deleted' })
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    await this.doctors.remove(id);
  }

  @Get(':id/patients')
  @ApiOperation({ summary: "List a doctor's patients with search, filters and pagination" })
  @ApiPaginatedResponse(PatientResponseDto)
  findPatients(
    @Param('id', ParseObjectIdPipe) id: string,
    @Query() query: QueryDoctorPatientsDto,
  ) {
    return this.doctors.findPatients(id, query);
  }

  @Post(':id/patients')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Add a patient under a doctor (ADMIN)' })
  @ApiCreatedResponse({ type: PatientResponseDto })
  addPatient(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: CreatePatientDto) {
    return this.doctors.addPatient(id, dto);
  }

  @Delete(':id/patients/:patientId')
  @Roles(Role.ADMIN)
  @HttpCode(204)
  @ApiOperation({ summary: "Remove a patient from a doctor's list (ADMIN)" })
  @ApiNoContentResponse({ description: 'Patient deleted' })
  async removePatient(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('patientId', ParseObjectIdPipe) patientId: string,
  ) {
    await this.doctors.removePatient(id, patientId);
  }
}