import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { dateRange, paginationMeta, skipTake } from '../common/utils/query.util.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { QueryPatientsDto } from './dto/query-patients.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';

const withDoctor = {
  doctor: { select: { id: true, name: true, specialization: true } },
} as const;

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(q: QueryPatientsDto) {
    const search = q.search;
    const where: Prisma.PatientWhereInput = {
      doctorId: q.doctorId,
      condition: q.condition,
      gender: q.gender,
      createdAt: dateRange(q.dateFrom, q.dateTo),
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
            { email: { contains: search, mode: 'insensitive' } },
            { condition: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        // id tie-breaker: pagination stable thake
        orderBy: [{ [q.sortBy]: q.sortOrder }, { id: q.sortOrder }],
        ...skipTake(q.page, q.limit),
        include: withDoctor,
      }),
      this.prisma.patient.count({ where }),
    ]);

    return { data, meta: paginationMeta(total, q.page, q.limit) };
  }

  /** Frontend condition filter dropdown er jonno. */
  async filterOptions() {
    const rows = await this.prisma.patient.groupBy({
      by: ['condition'],
      orderBy: { condition: 'asc' },
    });
    return { conditions: rows.map((r) => r.condition) };
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({ where: { id }, include: withDoctor });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async update(id: string, dto: UpdatePatientDto) {
    // record na thakle Prisma P2025 throw kore, PrismaExceptionFilter eke 404 banay
    return this.prisma.patient.update({ where: { id }, data: dto, include: withDoctor });
  }

  async remove(id: string) {
    await this.prisma.patient.delete({ where: { id } });
  }
}