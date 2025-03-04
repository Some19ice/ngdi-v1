import { CORSOptions } from 'hono/cors';
import { config } from './env';

/**
 * CORS configuration for the API
 */
export const corsOptions: CORSOptions = {
  origin: (origin) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return true;
    
    // Check if the origin is in the allowed list
    return config.cors.allowedOrigins.includes(origin) || config.cors.allowedOrigins.includes('*');
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token',
  ],
  exposeHeaders: ['Content-Length', 'X-CSRF-Token'],
  maxAge: 86400, // 24 hours
}; 