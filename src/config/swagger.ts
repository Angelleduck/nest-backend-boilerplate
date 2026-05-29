import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const swaggerSetup = (app: INestApplication) => {
  const isSwaggerEnabled = process.env.ENABLE_SWAGGER === 'true';

  if (!isSwaggerEnabled) {
    console.log('Swagger is not enabled in production');
    return;
  }

  const config = new DocumentBuilder()
    .setTitle('Backend API')
    .setDescription('API documentation for my nest js backend')
    .setVersion('1.0')
    .addCookieAuth(
      'access token',
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token',
      },
      'cookie-auth',
    )
    .addCookieAuth(
      'refresh token',
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'refresh_token',
      },
      'refresh_token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);
};

export { swaggerSetup };
