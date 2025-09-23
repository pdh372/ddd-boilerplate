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

  // Database Configuration
  DB_HOST: z.string().min(1, 'Database host is required'),
  DB_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((port) => port > 0 && port < 65536, {
      message: 'Database port must be between 1 and 65535',
    }),
  DB_USERNAME: z.string().min(1, 'Database username is required'),
  DB_PASSWORD: z.string().min(1, 'Database password is required'),
  DB_NAME: z.string().min(1, 'Database name is required'),

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
} as const;
