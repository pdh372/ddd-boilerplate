import { NestFactory } from '@nestjs/core';
import { AppModule } from './presentation/presentation.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@shared/config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {});

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const port = configService.port;

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  await app.listen(port, () => {
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`Environment: ${configService.nodeEnv}`);
  });
}

bootstrap().catch((error: Error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Error during application bootstrap:', error.message);
  logger.error(error.stack);
  process.exit(1);
});
