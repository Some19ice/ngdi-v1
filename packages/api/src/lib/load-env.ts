import * as dotenv from 'dotenv';
import * as path from 'path';
import { logger } from './logger';

// Load environment variables from .env files
export function loadEnv() {
  // Load .env file
  const envPath = path.resolve(process.cwd(), '.env');
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    logger.warn(`Error loading .env file: ${result.error.message}`);
  } else {
    logger.info(`Loaded environment variables from ${envPath}`);
  }

  // Load .env.local file (overrides .env)
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  const localResult = dotenv.config({ path: envLocalPath });

  if (!localResult.error) {
    logger.info(`Loaded environment variables from ${envLocalPath}`);
  }

  // Log Supabase configuration status
  logger.info('Supabase configuration status:', {
    url: process.env.SUPABASE_URL ? 'Set' : 'Not set',
    anonKey: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set',
  });
}
