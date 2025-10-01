import { z } from 'zod';

/**
 * Configuration validation schema using Zod
 * Provides type-safe and comprehensive validation
 */
export const ConfigSchema = z.object({
  // Application Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .optional()
    .default('3001')
    .transform((val) => parseInt(val, 10))
    .refine((port) => port > 0 && port < 65536, {
      message: 'Port must be between 1 and 65535',
    }),

  // Database Configuration (PostgreSQL - optional for development)
  DB_HOST: z.string().min(1, 'Database host is required').optional().default('localhost'),
  DB_PORT: z
    .string()
    .optional()
    .default('5432')
    .transform((val) => parseInt(val, 10))
    .refine((port) => port > 0 && port < 65536, {
      message: 'Database port must be between 1 and 65535',
    }),
  DB_USERNAME: z.string().min(1, 'Database username is required').optional().default('postgres'),
  DB_PASSWORD: z.string().min(1, 'Database password is required').optional().default('postgres'),
  DB_NAME: z.string().min(1, 'Database name is required').optional().default('ddd_boilerplate'),

  // MongoDB Configuration
  MONGODB_URI: z.string().min(1).optional().default('mongodb://localhost:27017/ddd_app'),

  // Security Configuration (optional)
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters').optional(),
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^\d+[smhd]$/, 'JWT expiration must be in format like 1h, 30m, 7d')
    .optional()
    .default('3600s'),

  // Logging Configuration (optional)
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'verbose']).optional().default('info'),

  // Redis Configuration
  REDIS_HOST: z.string().min(1, 'Redis host is required').optional().default('localhost'),
  REDIS_PORT: z
    .string()
    .optional()
    .default('6379')
    .transform((val) => parseInt(val, 10))
    .refine((port) => port > 0 && port < 65536, {
      message: 'Redis port must be between 1 and 65535',
    }),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z
    .string()
    .optional()
    .default('0')
    .transform((val) => parseInt(val, 10))
    .refine((db) => db >= 0 && db < 16, {
      message: 'Redis DB must be between 0 and 15',
    }),
  REDIS_TTL: z
    .string()
    .optional()
    .default('3600')
    .transform((val) => parseInt(val, 10))
    .refine((ttl) => ttl > 0, {
      message: 'Redis TTL must be positive',
    }),
  REDIS_ENABLED: z
    .string()
    .optional()
    .default('true')
    .transform((val) => val.toLowerCase() === 'true'),
});

export type ConfigType = z.infer<typeof ConfigSchema>;

/**
 * Environment variable names for type safety
 */
export const ENV_KEYS = {
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  DB_HOST: 'DB_HOST',
  DB_PORT: 'DB_PORT',
  DB_USERNAME: 'DB_USERNAME',
  DB_PASSWORD: 'DB_PASSWORD',
  DB_NAME: 'DB_NAME',
  MONGODB_URI: 'MONGODB_URI',
  JWT_SECRET: 'JWT_SECRET',
  JWT_EXPIRES_IN: 'JWT_EXPIRES_IN',
  LOG_LEVEL: 'LOG_LEVEL',
  REDIS_HOST: 'REDIS_HOST',
  REDIS_PORT: 'REDIS_PORT',
  REDIS_PASSWORD: 'REDIS_PASSWORD',
  REDIS_DB: 'REDIS_DB',
  REDIS_TTL: 'REDIS_TTL',
  REDIS_ENABLED: 'REDIS_ENABLED',
} as const;
