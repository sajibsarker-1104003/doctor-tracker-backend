import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter.js';
import { setupSwagger } from './config/swagger.config.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  const port = config.get<number>('PORT', 8080);

  const publicUrl =
    config.get<string>('API_PUBLIC_URL') ??
    config.get<string>('RENDER_EXTERNAL_URL') ??
    `http://localhost:${port}`;

  const swaggerEnabled = config.get<string>('SWAGGER_ENABLED', 'true') === 'true';

  // Render sits behind a proxy: needed for secure cookies and correct client IPs
  app.set('trust proxy', 1);

  // security + performance
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'script-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
    compression(),
  );

  // CORS: comma-separated origins, trailing slashes removed
  const allowedOrigins = (config.get<string>('CLIENT_URL') ?? '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

  // always allow local development
  allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000','https://doctor-tracker-client.onrender.com');

  app.enableCors({
    origin: (origin, callback) => {
      // no Origin header = curl, server-to-server, Render proxy: allow
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin.replace(/\/$/, ''))) {
        return callback(null, true);
      }

      // never pass an Error here, it would turn into a 500
      logger.warn(`CORS blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    maxAge: 86400,
  });

  app.enableShutdownHooks();

  // routing
  app.setGlobalPrefix('api/v1');

  // validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // error handling (specific filter last = higher priority)
  app.useGlobalFilters(new AllExceptionsFilter(), new PrismaExceptionFilter());

  // swagger docs
  if (swaggerEnabled) {
    setupSwagger(app, publicUrl);
  }

  // Render needs the server bound to all interfaces
  await app.listen(port, '0.0.0.0');
  logger.log(`API running at ${publicUrl}/api/v1`);
  logger.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
  if (swaggerEnabled) {
    logger.log(`Docs available at ${publicUrl}/api/docs`);
  }
}

bootstrap();