import { Injectable, Logger } from '@nestjs/common';
import { ConfigSchema, type ConfigType } from './config.schema';

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
  security?:
    | {
        jwtSecret?: string;
        jwtExpiresIn: string;
      }
    | undefined;
  logging: {
    level: string;
  };
}

@Injectable()
export class ConfigService {
  private readonly config: IAppConfig;
  private readonly logger = new Logger(ConfigService.name);

  constructor() {
    this.config = this.validateAndBuildConfig();
  }

  private validateAndBuildConfig(): IAppConfig {
    try {
      // Parse and validate environment variables using Zod schema
      const validatedEnv: ConfigType = ConfigSchema.parse(process.env);

      this.logger.log('Configuration validated successfully with Zod schema');

      return {
        port: validatedEnv.PORT,
        nodeEnv: validatedEnv.NODE_ENV,
        database: {
          mongodb: {
            uri: validatedEnv.MONGODB_URI,
          },
          postgres: {
            host: validatedEnv.DB_HOST,
            port: validatedEnv.DB_PORT,
            username: validatedEnv.DB_USERNAME,
            password: validatedEnv.DB_PASSWORD,
            database: validatedEnv.DB_NAME,
          },
        },
        security:
          validatedEnv.JWT_SECRET != null && validatedEnv.JWT_SECRET !== ''
            ? {
                jwtSecret: validatedEnv.JWT_SECRET,
                jwtExpiresIn: validatedEnv.JWT_EXPIRES_IN,
              }
            : undefined,
        logging: {
          level: validatedEnv.LOG_LEVEL,
        },
      };
    } catch (error) {
      this.logger.error('Configuration validation failed:', error);
      throw new Error(`Configuration validation failed: ${String(error)}`);
    }
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

  get security(): IAppConfig['security'] {
    return this.config.security;
  }

  get logging(): IAppConfig['logging'] {
    return this.config.logging;
  }
}
