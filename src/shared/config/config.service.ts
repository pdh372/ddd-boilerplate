import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { join } from 'path';

export interface IDatabaseConfig {
  mongodb: {
    uri: string;
  };
  postgres: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
}

export interface IAppConfig {
  port: number;
  nodeEnv: string;
  database: IDatabaseConfig;
}

@Injectable()
export class ConfigService {
  private readonly config: IAppConfig;

  constructor() {
    // Load .env file explicitly
    dotenv.config({ path: join(process.cwd(), '.env') });
    this.config = this.validateAndBuildConfig();
  }

  private validateAndBuildConfig(): IAppConfig {
    // PostgreSQL is optional for development, MongoDB is primary
    const requiredEnvVars = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'] as const;

    // Only validate PostgreSQL vars if not using just MongoDB
    if (process.env.NODE_ENV !== 'development' || process.env.USE_POSTGRES === 'true') {
      for (const envVar of requiredEnvVars) {
        const value = process.env[envVar];
        if (value === undefined || value === '') {
          throw new Error(`Missing required environment variable: ${envVar}`);
        }
      }
    }

    const dbPort = process.env.DB_PORT;
    if (process.env.USE_POSTGRES === 'true' && (dbPort === undefined || dbPort === '' || isNaN(parseInt(dbPort, 10)))) {
      throw new Error('DB_PORT must be a valid number when using PostgreSQL');
    }

    const appPort = process.env.PORT;
    if (appPort !== undefined && appPort !== '' && isNaN(parseInt(appPort, 10))) {
      throw new Error('PORT must be a valid number');
    }

    return {
      port: parseInt(appPort ?? '3001', 10),
      nodeEnv: process.env.NODE_ENV ?? 'development',
      database: {
        mongodb: {
          uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/ddd_app',
        },
        postgres: {
          host: process.env.DB_HOST ?? 'localhost',
          port: parseInt(dbPort ?? '5432', 10),
          username: process.env.DB_USERNAME ?? 'postgres',
          password: process.env.DB_PASSWORD ?? 'postgres',
          database: process.env.DB_NAME ?? 'ddd_boilerplate',
        },
      },
    };
  }

  get port(): number {
    return this.config.port;
  }

  get nodeEnv(): string {
    return this.config.nodeEnv;
  }

  get isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }

  get database(): IDatabaseConfig {
    return this.config.database;
  }
}
