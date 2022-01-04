import { NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

const bootstrap = async () => {
  const options: NestApplicationOptions = {
    cors: {
      origin: 'http://localhost:3000',
      credentials: true,
    },
  };

  const app = await NestFactory.create(AppModule, options);

  // Middleware
  app.use(cookieParser());

  // Pipes
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');

  await app.listen(port);
};

bootstrap();
