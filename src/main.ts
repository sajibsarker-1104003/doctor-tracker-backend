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

  // security + performance
  app.use(helmet(), compression());
  app.enableCors({ origin: config.get<string>('CLIENT_URL'), credentials: true });
  app.enableShutdownHooks();

  // routing
  app.setGlobalPrefix('api/v1');

  // validation + error handling (specific filter last = higher priority)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter(), new PrismaExceptionFilter());

  // swagger docs
  if (config.get<string>('SWAGGER_ENABLED', 'true') === 'true') {
    setupSwagger(app, `http://localhost:${port}`);
  }

  await app.listen(port);
  console.log(`API running on http://localhost:${port}/api/v1`);
  console.log(`Docs available at http://localhost:${port}/api/docs`);
}

bootstrap();