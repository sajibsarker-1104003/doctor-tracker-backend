import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrors } from '../common/decorators/api-common-errors.decorator.js';
import { DashboardService } from './dashboard.service.js';
import { LimitQueryDto, TimelineQueryDto } from './dto/dashboard-query.dto.js';
import {
  ConditionStatDto,
  PatientsPerDoctorDto,
  SpecializationStatDto,
  SummaryResponseDto,
  TimelineResponseDto,
} from './dto/dashboard-response.dto.js';

@ApiTags('Dashboard')
@ApiBearerAuth()
@ApiCommonErrors()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Totals and last-30-days growth (stat cards)' })
  @ApiOkResponse({ type: SummaryResponseDto })
  summary() {
    return this.dashboard.summary();
  }

  @Get('patients-per-doctor')
  @ApiOperation({ summary: 'Top doctors by number of patients (bar chart)' })
  @ApiOkResponse({ type: [PatientsPerDoctorDto] })
  patientsPerDoctor(@Query() { limit }: LimitQueryDto) {
    return this.dashboard.patientsPerDoctor(limit);
  }

  @Get('timeline')
  @ApiOperation({ summary: 'New patients and doctors over time, by day or month (line/area chart)' })
  @ApiOkResponse({ type: TimelineResponseDto })
  timeline(@Query() query: TimelineQueryDto) {
    return this.dashboard.timeline(query);
  }

  @Get('conditions')
  @ApiOperation({ summary: 'Most common patient conditions (donut chart)' })
  @ApiOkResponse({ type: [ConditionStatDto] })
  conditions(@Query() { limit }: LimitQueryDto) {
    return this.dashboard.conditions(limit);
  }

  @Get('specializations')
  @ApiOperation({ summary: 'Doctors per specialization' })
  @ApiOkResponse({ type: [SpecializationStatDto] })
  specializations(@Query() { limit }: LimitQueryDto) {
    return this.dashboard.specializations(limit);
  }
}