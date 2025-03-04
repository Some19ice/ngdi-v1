import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { errorHandler } from '../middleware/error-handler';
import { rateLimiter } from '../middleware/rate-limiter';
import { config } from '../config';
import authRouter from './auth.routes';
import userRouter from './user.routes';
import metadataRouter from './metadata.routes';
import adminRouter from './admin.routes';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/openapi';

// Create API router
const api = new OpenAPIHono({
  defaultHook: (ctx, c) => {
    return {
      operationId: ctx.operationId,
      tags: ctx.tags,
      summary: ctx.summary,
      description: ctx.description,
    };
  },
});

// Apply global middleware
api.use('*', logger());
api.use('*', prettyJSON());
api.use('*', secureHeaders());
api.use('*', errorHandler());
api.use('*', rateLimiter());

// Apply CORS
api.use('*', cors({
  origin: config.corsOrigins,
  allowHeaders: ['Authorization', 'Content-Type'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  maxAge: 86400,
  credentials: true,
}));

// Mount routes
api.route('/auth', authRouter);
api.route('/users', userRouter);
api.route('/metadata', metadataRouter);
api.route('/admin', adminRouter);

// Create main app
const app = new Hono();

// Mount API under /api
app.route('/api', api);

// Swagger UI
app.get(
  '/docs',
  swaggerUI({
    url: '/api/docs',
    title: 'Metadata API Documentation',
  })
);

// OpenAPI documentation
api.doc('/docs', {
  openapi: '3.0.0',
  info: {
    title: 'Metadata API',
    version: '1.0.0',
    description: 'API for managing metadata records',
  },
  servers: [
    {
      url: '/api',
      description: 'API server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    responses: {
      BadRequest: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false,
                },
                message: {
                  type: 'string',
                  example: 'Invalid request data',
                },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      path: {
                        type: 'string',
                      },
                      message: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false,
                },
                message: {
                  type: 'string',
                  example: 'Unauthorized',
                },
              },
            },
          },
        },
      },
      Forbidden: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false,
                },
                message: {
                  type: 'string',
                  example: 'Forbidden',
                },
              },
            },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false,
                },
                message: {
                  type: 'string',
                  example: 'Resource not found',
                },
              },
            },
          },
        },
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false,
                },
                message: {
                  type: 'string',
                  example: 'Internal server error',
                },
              },
            },
          },
        },
      },
    },
  },
});

export default app;
