import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(e: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const target = Array.isArray(e.meta?.target) ? (e.meta?.target as string[]).join(', ') : 'field';
    const map: Record<string, [number, string]> = {
      P2002: [HttpStatus.CONFLICT, `Duplicate value for: ${target}`],
      P2025: [HttpStatus.NOT_FOUND, 'Record not found'],
      P2023: [HttpStatus.BAD_REQUEST, 'Invalid ID format'],
      P2014: [HttpStatus.BAD_REQUEST, 'Relation constraint violation'],
    };
    const [status, message] = map[e.code] ?? [HttpStatus.INTERNAL_SERVER_ERROR, 'Database error'];
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) this.logger.error(e.message, e.stack);

    res.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}