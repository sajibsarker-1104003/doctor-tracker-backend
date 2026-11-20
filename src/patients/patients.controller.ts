import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Query } from '@nestjs/common';
import {
  ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ApiCommonErrors } from '../common/decorators/api-common-errors.decorator.js';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';
import { PatientListItemDto } from './dto/patient-list-item.dto.js';
import { QueryPatientsDto } from './dto/query-patients.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';
import { PatientsService } from './patients.service.js';

@ApiTags('Patients')
@ApiBearerAuth()
@ApiCommonErrors()
@Controller('patients')
export class PatientsController {
  constructor(private readonly patients: PatientsService) {}

  @Get()
  @ApiOperation({ summary: 'List all patients with search, filters and pagination' })
  @ApiPaginatedResponse(PatientListItemDto)
  findAll(@Query() query: QueryPatientsDto) {
    return this.patients.findAll(query);
  }

  // :id route er age rakhte hobe
  @Get('filter-options')
  @ApiOperation({ summary: 'Distinct conditions for the filter dropdown' })
  filterOptions() {
    return this.patients.filterOptions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a patient by id' })
  @ApiOkResponse({ type: PatientListItemDto })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.patients.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Edit patient information (ADMIN)' })
  @ApiOkResponse({ type: PatientListItemDto })
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdatePatientDto) {
    return this.patients.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a patient (ADMIN)' })
  @ApiNoContentResponse({ description: 'Patient deleted' })
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    await this.patients.remove(id);
  }
}