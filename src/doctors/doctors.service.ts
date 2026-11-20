import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { dateRange, paginationMeta, skipTake } from '../common/utils/query.util.js';
import { CreatePatientDto } from '../patients/dto/create-patient.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDoctorDto } from './dto/create-doctor.dto.js';
import { QueryDoctorPatientsDto } from './dto/query-doctor-patients.dto.js';
import { QueryDoctorsDto } from './dto/query-doctors.dto.js';

const withCount = { _count: { select: { patients: true } } } as const;

function toResponse<T extends { _count: { patients: number } }>(doctor: T) {
  const { _count, ...rest } = doctor;
  return { ...rest, patientCount: _count.patients };
}

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDoctorDto) {
    const doctor = await this.prisma.doctor.create({ data: dto, include: withCount });
    return toResponse(doctor);
  }

  async findAll(q: QueryDoctorsDto) {
    const search = q.search;
    const where: Prisma.DoctorWhereInput = {
      specialization: q.specialization,
      hospital: q.hospital,
      createdAt: dateRange(q.dateFrom, q.dateTo),
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { hospital: { contains: search, mode: 'insensitive' } },
            { specialization: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where,
        // id tie-breaker: pagination e duplicate/miss hoy na
        orderBy: [{ [q.sortBy]: q.sortOrder }, { id: q.sortOrder }],
        ...skipTake(q.page, q.limit),
        include: withCount,
      }),
      this.prisma.doctor.count({ where }),
    ]);

    return { data: items.map(toResponse), meta: paginationMeta(total, q.page, q.limit) };
  }

  /** Frontend filter dropdown er jonno distinct value gulo. */
  async filterOptions() {
    const [specs, hospitals] = await Promise.all([
      this.prisma.doctor.groupBy({ by: ['specialization'], orderBy: { specialization: 'asc' } }),
      this.prisma.doctor.groupBy({ by: ['hospital'], orderBy: { hospital: 'asc' } }),
    ]);
    return {
      specializations: specs.map((s) => s.specialization),
      hospitals: hospitals.map((h) => h.hospital),
    };
  }

  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id }, include: withCount });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return toResponse(doctor);
  }

  async findPatients(doctorId: string, q: QueryDoctorPatientsDto) {
    await this.ensureExists(doctorId);

    const search = q.search;
    const where: Prisma.PatientWhereInput = {
      doctorId,
      condition: q.condition,
      createdAt: dateRange(q.dateFrom, q.dateTo),
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
            { email: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        orderBy: [{ createdAt: q.sortOrder }, { id: q.sortOrder }],
        ...skipTake(q.page, q.limit),
      }),
      this.prisma.patient.count({ where }),
    ]);

    return { data, meta: paginationMeta(total, q.page, q.limit) };
  }

  async addPatient(doctorId: string, dto: CreatePatientDto) {
    await this.ensureExists(doctorId);
    return this.prisma.patient.create({ data: { ...dto, doctorId } });
  }

  async removePatient(doctorId: string, patientId: string) {
    // doctorId shoho filter: onno doctor er patient delete kora jabe na
    const { count } = await this.prisma.patient.deleteMany({
      where: { id: patientId, doctorId },
    });
    if (count === 0) throw new NotFoundException('Patient not found for this doctor');
  }

  private async ensureExists(id: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id }, select: { id: true } });
    if (!doctor) throw new NotFoundException('Doctor not found');
  }
}