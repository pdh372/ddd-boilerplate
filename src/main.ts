import { NestFactory } from '@nestjs/core';

import { AppModule } from './presentation/presentation.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['debug', 'error', 'fatal', 'verbose', 'warn'] });

  const port = process.env.PORT || 3001;

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(port, () => {
    console.info(`Application is running on: http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Error during application bootstrap:', error);
});
