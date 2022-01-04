import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import appConfig from './app.config';
import authConfig from './auth.config';
import databaseConfig from './database.config';
import mailConfig from './mail.config';

const validationSchema = Joi.object({
  // Server
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production').default('development'),

  // Database
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.string().required(),
  POSTGRES_USERNAME: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DATABASE: Joi.string().required(),

  // Auth
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRY_TIME: Joi.number().required(),

  // Mail
  MAIL_HOST: Joi.string(),
  MAIL_PORT: Joi.string(),
  MAIL_USERNAME: Joi.string(),
  MAIL_PASSWORD: Joi.string(),
});

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [appConfig, authConfig, databaseConfig, mailConfig],
      validationSchema: validationSchema,
    }),
  ],
})
export class ConfigModule {}
