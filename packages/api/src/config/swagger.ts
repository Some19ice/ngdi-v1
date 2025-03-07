import { OpenAPIHono } from "@hono/zod-openapi"
import { swaggerUI } from "@hono/swagger-ui"
import { config } from "./index"

export const app = new OpenAPIHono()

app.get(
  "/docs",
  swaggerUI({
    url: "/api-docs",
  })
)

app.doc("/api-docs", {
  openapi: "3.1.0",
  info: {
    title: "NGDI Portal API",
    version: "1.0.0",
    description: "API documentation for the NGDI Portal",
  },
  servers: [
    {
      url: process.env.API_URL || "http://localhost:3001",
      description: "API Server",
    },
  ],
})

export const swaggerConfig = {
  openapi: "3.0.0",
  info: {
    title: "NGDI Portal API",
    version: "1.0.0",
    description: "API documentation for the NGDI Portal",
  },
  servers: [
    {
      url: `http://${config.server.host}:${config.port}`,
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          code: { type: "string" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
      Metadata: {
        type: "object",
        required: ["title", "author", "organization"],
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          author: { type: "string" },
          organization: { type: "string" },
          abstract: { type: "string" },
          purpose: { type: "string" },
          dateFrom: { type: "string", format: "date" },
          dateTo: { type: "string", format: "date" },
          categories: {
            type: "array",
            items: { type: "string" },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      MetadataResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {
            $ref: "#/components/schemas/Metadata",
          },
        },
      },
      MetadataListResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Metadata",
                },
              },
              total: { type: "integer" },
              page: { type: "integer" },
              limit: { type: "integer" },
              totalPages: { type: "integer" },
            },
          },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "Unauthorized - JWT token is missing or invalid",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      Forbidden: {
        description: "Forbidden - User does not have required permissions",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      ValidationError: {
        description: "Validation error in request data",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      InternalServerError: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    "/metadata": {
      get: {
        summary: "Get a list of metadata records",
        description:
          "Retrieve a paginated list of metadata records with optional filtering",
        parameters: [
          {
            name: "page",
            in: "query",
            description: "Page number for pagination",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            description: "Number of items per page",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
          },
          {
            name: "search",
            in: "query",
            description: "Search term to filter metadata",
            schema: { type: "string" },
          },
          {
            name: "category",
            in: "query",
            description: "Filter by category",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved metadata list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MetadataListResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
      post: {
        summary: "Create a new metadata record",
        description: "Create a new metadata record with the provided data",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Metadata",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Metadata created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MetadataResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/metadata/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "ID of the metadata record",
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        summary: "Get a specific metadata record",
        description: "Retrieve a metadata record by its ID",
        responses: {
          "200": {
            description: "Successfully retrieved metadata",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MetadataResponse" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
      put: {
        summary: "Update a metadata record",
        description:
          "Update an existing metadata record with the provided data",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Metadata",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Metadata updated successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MetadataResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
      delete: {
        summary: "Delete a metadata record",
        description: "Delete a metadata record by its ID",
        responses: {
          "204": {
            description: "Metadata deleted successfully",
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
  },
} as const
