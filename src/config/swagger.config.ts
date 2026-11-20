import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication, serverUrl: string) {
  const config = new DocumentBuilder()
    .setTitle('Doctor Tracker API')
    .setDescription(
      [
        'REST API for managing doctors and their patients, with dashboard analytics.',
        '',
        '**Authentication:** call `POST /auth/login`, copy the `accessToken`, then click **Authorize** and paste it.',
        '',
        '**Roles:** `ADMIN` has full access. `USER` has read-only access.',
        '',
        '**Errors:** every error follows the same shape: `success`, `statusCode`, `message`, `path`, `timestamp`.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addServer(serverUrl, 'Current environment')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Paste the access token (without the "Bearer " prefix)',
    })
    .addTag('Auth', 'Login, token refresh and current user')
    .addTag('Doctors', 'Doctor management and their patients')
    .addTag('Patients', 'Patient management')
    .addTag('Dashboard', 'Analytics and aggregated statistics')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Doctor Tracker API Docs',
    jsonDocumentUrl: 'api/docs-json',
    swaggerOptions: {
      persistAuthorization: true, // refresh dileo token thakbe
      displayRequestDuration: true,
      filter: true,
      docExpansion: 'none',
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}