import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter.js';
import { setupSwagger } from './config/swagger.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 8080);

  const publicUrl =
    config.get<string>('API_PUBLIC_URL') ??
    config.get<string>('RENDER_EXTERNAL_URL') ??
    `http://localhost:${port}`;

  const swaggerEnabled = config.get<string>('SWAGGER_ENABLED', 'true') === 'true';

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
    }),
    compression(),
  );

  // CORS: one or more comma-separated origins, trailing slashes removed
  const origins = (config.get<string>('CLIENT_URL') ?? '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

  app.enableCors({
    origin: origins.length ? origins : true,
    credentials: true,
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
  console.log(`API running at ${publicUrl}/api/v1`);
  if (swaggerEnabled) {
    console.log(`Docs available at ${publicUrl}/api/docs`);
  }
}

bootstrap();