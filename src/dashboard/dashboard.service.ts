import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { TimelineQueryDto } from './dto/dashboard-query.dto.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RANGE_DAYS = 1100;
const MAX_DAILY_RANGE_DAYS = 366;

const parseKey = (k: string) => new Date(`${k}T00:00:00.000Z`);
const toKey = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (k: string, n: number) => toKey(new Date(parseKey(k).getTime() + n * DAY_MS));
const round1 = (n: number) => Math.round(n * 10) / 10;
const growth = (current: number, previous: number) =>
  previous === 0 ? null : round1(((current - previous) / previous) * 100);

@Injectable()
export class DashboardService {
  private readonly tz: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.tz = config.get<string>('DASHBOARD_TIMEZONE', 'Asia/Dhaka');
  }

  /** Stat card: totals + last 30 days growth. Shob count query parallel e cholbe. */
  async summary() {
    const now = Date.now();
    const d30 = new Date(now - 30 * DAY_MS);
    const d60 = new Date(now - 60 * DAY_MS);

    const [totalDoctors, totalPatients, newDoctors, prevDoctors, newPatients, prevPatients] =
      await Promise.all([
        this.prisma.doctor.count(),
        this.prisma.patient.count(),
        this.prisma.doctor.count({ where: { createdAt: { gte: d30 } } }),
        this.prisma.doctor.count({ where: { createdAt: { gte: d60, lt: d30 } } }),
        this.prisma.patient.count({ where: { createdAt: { gte: d30 } } }),
        this.prisma.patient.count({ where: { createdAt: { gte: d60, lt: d30 } } }),
      ]);

    return {
      totalDoctors,
      totalPatients,
      avgPatientsPerDoctor: totalDoctors ? round1(totalPatients / totalDoctors) : 0,
      doctors: { last30Days: newDoctors, growthPercent: growth(newDoctors, prevDoctors) },
      patients: { last30Days: newPatients, growthPercent: growth(newPatients, prevPatients) },
    };
  }

  /** Top doctor by patient count: groupBy (DB) + ek ta lookup query. */
  async patientsPerDoctor(limit: number) {
    const rows = await this.prisma.patient.groupBy({
      by: ['doctorId'],
      _count: { _all: true },
      orderBy: [{ _count: { doctorId: 'desc' } }, { doctorId: 'asc' }],
      take: limit,
    });

    const doctors = await this.prisma.doctor.findMany({
      where: { id: { in: rows.map((r) => r.doctorId) } },
      select: { id: true, name: true, specialization: true },
    });
    const byId = new Map(doctors.map((d) => [d.id, d]));

    return rows.map((r) => ({
      doctorId: r.doctorId,
      name: byId.get(r.doctorId)?.name ?? 'Unknown',
      specialization: byId.get(r.doctorId)?.specialization ?? '-',
      patientCount: r._count._all,
    }));
  }

  /** Date-wise stats (day/month), missing date e 0 boshiye. */
  async timeline(q: TimelineQueryDto) {
    const to = q.to ?? this.todayKey();
    const from = q.from ?? this.defaultFrom(to, q.interval);

    if (from > to) throw new BadRequestException('"from" must be before or equal to "to"');
    const days = Math.round((parseKey(to).getTime() - parseKey(from).getTime()) / DAY_MS) + 1;
    if (days > MAX_RANGE_DAYS) {
      throw new BadRequestException(`Date range too large (max ${MAX_RANGE_DAYS} days)`);
    }
    if (q.interval === 'day' && days > MAX_DAILY_RANGE_DAYS) {
      throw new BadRequestException(
        `Daily interval supports up to ${MAX_DAILY_RANGE_DAYS} days. Use interval=month for longer ranges`,
      );
    }

    const [patientDays, doctorDays] = await Promise.all([
      this.dailyCounts((pipeline) => this.prisma.patient.aggregateRaw({ pipeline }), from, to),
      this.dailyCounts((pipeline) => this.prisma.doctor.aggregateRaw({ pipeline }), from, to),
    ]);

    // zero-filled bucket (day ba month)
    const buckets = new Map<string, { patients: number; doctors: number }>();
    for (let k = from; k <= to; k = addDays(k, 1)) {
      const label = q.interval === 'month' ? k.slice(0, 7) : k;
      if (!buckets.has(label)) buckets.set(label, { patients: 0, doctors: 0 });
    }
    const fill = (src: Map<string, number>, field: 'patients' | 'doctors') => {
      for (const [day, count] of src) {
        if (day < from || day > to) continue; // padding er extra din bad
        const label = q.interval === 'month' ? day.slice(0, 7) : day;
        const bucket = buckets.get(label);
        if (bucket) bucket[field] += count;
      }
    };
    fill(patientDays, 'patients');
    fill(doctorDays, 'doctors');

    return {
      interval: q.interval,
      from,
      to,
      data: [...buckets].map(([date, v]) => ({ date, ...v })),
    };
  }

  async conditions(limit: number) {
    const rows = await this.prisma.patient.groupBy({
      by: ['condition'],
      _count: { _all: true },
      orderBy: [{ _count: { condition: 'desc' } }, { condition: 'asc' }],
      take: limit,
    });
    return rows.map((r) => ({ condition: r.condition, count: r._count._all }));
  }

  async specializations(limit: number) {
    const rows = await this.prisma.doctor.groupBy({
      by: ['specialization'],
      _count: { _all: true },
      orderBy: [{ _count: { specialization: 'desc' } }, { specialization: 'asc' }],
      take: limit,
    });
    return rows.map((r) => ({ specialization: r.specialization, count: r._count._all }));
  }

  // ---------- helpers ----------

  /**
   * Mongo $group diye din onujayi count ($match createdAt index use kore).
   * Timezone er jonno range ke 1 din age/pore pad kora hoy, tarpor JS e range er bahire gulo felа hoy.
   */
  private async dailyCounts(
    run: (pipeline: Prisma.InputJsonValue[]) => Promise<unknown>,
    from: string,
    to: string,
  ) {
    const gte = new Date(parseKey(from).getTime() - DAY_MS).toISOString();
    const lt = new Date(parseKey(to).getTime() + 2 * DAY_MS).toISOString();

    const rows = (await run([
      { $match: { createdAt: { $gte: { $date: gte }, $lt: { $date: lt } } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: this.tz } },
          count: { $sum: 1 },
        },
      },
    ])) as { _id: string; count: number }[];

    return new Map(rows.map((r) => [r._id, r.count]));
  }

  private todayKey() {
    // en-CA locale => YYYY-MM-DD
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: this.tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }

  private defaultFrom(to: string, interval: 'day' | 'month') {
    if (interval === 'day') return addDays(to, -29);
    const d = parseKey(to);
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - 11);
    return toKey(d);
  }
}