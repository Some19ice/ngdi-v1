# Database Query Optimization

This document outlines query patterns and optimization techniques for the NGDI Portal database.

## Overview

Efficient database queries are essential for application performance. This document provides guidelines for optimizing database queries in the NGDI Portal application.

## Common Query Patterns

### User Queries

1. **User Authentication**:
   ```typescript
   // Find user by email for authentication
   const user = await prisma.user.findUnique({
     where: { email },
     include: { customRole: true }
   });
   ```

2. **User Profile**:
   ```typescript
   // Get user profile with role information
   const profile = await prisma.user.findUnique({
     where: { id },
     select: {
       id: true,
       name: true,
       email: true,
       image: true,
       organization: true,
       department: true,
       phone: true,
       role: true,
       customRole: {
         select: {
           name: true,
           description: true
         }
       }
     }
   });
   ```

3. **User Permissions**:
   ```typescript
   // Get user permissions (both direct and role-based)
   const permissions = await prisma.user.findUnique({
     where: { id },
     select: {
       customRole: {
         select: {
           rolePermissions: {
             select: {
               permission: true
             }
           }
         }
       },
       userPermissions: {
         where: {
           granted: true,
           OR: [
             { expiresAt: null },
             { expiresAt: { gt: new Date() } }
           ]
         },
         select: {
           permission: true,
           conditions: true
         }
       }
     }
   });
   ```

### Metadata Queries

1. **Metadata Listing**:
   ```typescript
   // Get paginated metadata list with filtering
   const metadata = await prisma.metadata.findMany({
     where: {
       AND: [
         { title: { contains: searchTerm, mode: 'insensitive' } },
         { dataType: { in: dataTypes } },
         { organization: { in: organizations } },
         { validationStatus: { in: statuses } }
       ]
     },
     orderBy: { [sortField]: sortOrder },
     skip: (page - 1) * pageSize,
     take: pageSize,
     select: {
       id: true,
       title: true,
       dataName: true,
       dataType: true,
       abstract: true,
       thumbnailUrl: true,
       organization: true,
       author: true,
       categories: true,
       validationStatus: true,
       createdAt: true,
       updatedAt: true,
       user: {
         select: {
           name: true,
           email: true
         }
       }
     }
   });
   ```

2. **Metadata Detail**:
   ```typescript
   // Get detailed metadata information
   const detail = await prisma.metadata.findUnique({
     where: { id },
     include: {
       user: {
         select: {
           name: true,
           email: true,
           organization: true
         }
       }
     }
   });
   ```

3. **Spatial Queries**:
   ```typescript
   // Find metadata within a bounding box
   const spatialMetadata = await prisma.$queryRaw`
     SELECT id, title, "dataName", "dataType", "minLatitude", "minLongitude", "maxLatitude", "maxLongitude"
     FROM "Metadata"
     WHERE "minLongitude" <= ${maxLon}
       AND "maxLongitude" >= ${minLon}
       AND "minLatitude" <= ${maxLat}
       AND "maxLatitude" >= ${minLat}
   `;
   ```

### Security and Activity Logs

1. **Security Log Queries**:
   ```typescript
   // Get recent security logs
   const securityLogs = await prisma.securityLog.findMany({
     where: {
       eventType: { in: eventTypes },
       createdAt: { gte: startDate, lte: endDate }
     },
     orderBy: { createdAt: 'desc' },
     take: limit,
     include: {
       user: {
         select: {
           name: true,
           email: true
         }
       }
     }
   });
   ```

2. **Activity Log Queries**:
   ```typescript
   // Get user activity logs
   const activityLogs = await prisma.activityLog.findMany({
     where: {
       userId,
       action: { in: actions },
       createdAt: { gte: startDate, lte: endDate }
     },
     orderBy: { createdAt: 'desc' },
     take: limit
   });
   ```

## Optimization Techniques

### 1. Use Indexes Effectively

The database schema includes indexes for common query patterns. Use these indexes to improve query performance:

```typescript
// Good: Uses the idx_Metadata_title index
const metadata = await prisma.metadata.findMany({
  where: { title: { contains: searchTerm } }
});

// Bad: Doesn't use an index
const metadata = await prisma.metadata.findMany({
  where: { abstract: { contains: searchTerm } }
});
```

### 2. Select Only Required Fields

Only select the fields you need to reduce the amount of data transferred:

```typescript
// Good: Selects only required fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true
  }
});

// Bad: Selects all fields
const users = await prisma.user.findMany();
```

### 3. Use Pagination

Always use pagination for large result sets:

```typescript
// Good: Uses pagination
const metadata = await prisma.metadata.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize
});

// Bad: Retrieves all records
const metadata = await prisma.metadata.findMany();
```

### 4. Optimize Joins

Be careful with nested includes and selects:

```typescript
// Good: Selects only required nested fields
const users = await prisma.user.findMany({
  include: {
    metadata: {
      select: {
        id: true,
        title: true
      }
    }
  }
});

// Bad: Includes all nested fields
const users = await prisma.user.findMany({
  include: {
    metadata: true
  }
});
```

### 5. Use Transactions for Multiple Operations

Use transactions for operations that require multiple database queries:

```typescript
// Good: Uses a transaction
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.securityLog.create({
    data: {
      userId: user.id,
      eventType: 'USER_CREATED',
      ipAddress,
      userAgent
    }
  });
  return user;
});

// Bad: Doesn't use a transaction
const user = await prisma.user.create({ data: userData });
await prisma.securityLog.create({
  data: {
    userId: user.id,
    eventType: 'USER_CREATED',
    ipAddress,
    userAgent
  }
});
```

### 6. Use Batch Operations

Use batch operations for bulk updates or deletes:

```typescript
// Good: Uses batch operation
await prisma.metadata.updateMany({
  where: { userId },
  data: { organization: newOrganization }
});

// Bad: Updates records one by one
const metadata = await prisma.metadata.findMany({ where: { userId } });
for (const item of metadata) {
  await prisma.metadata.update({
    where: { id: item.id },
    data: { organization: newOrganization }
  });
}
```

### 7. Use JSON Fields Efficiently

When working with JSON fields, use efficient query patterns:

```typescript
// Good: Uses JSON field efficiently
const metadata = await prisma.metadata.findMany({
  where: {
    locationInfo: {
      path: ['country'],
      equals: 'Nigeria'
    }
  }
});

// Bad: Filters JSON field in application code
const metadata = await prisma.metadata.findMany();
const filtered = metadata.filter(
  m => m.locationInfo?.country === 'Nigeria'
);
```

### 8. Avoid N+1 Query Problems

Use includes to avoid N+1 query problems:

```typescript
// Good: Avoids N+1 query problem
const users = await prisma.user.findMany({
  include: {
    metadata: true
  }
});

// Bad: Causes N+1 query problem
const users = await prisma.user.findMany();
for (const user of users) {
  user.metadata = await prisma.metadata.findMany({
    where: { userId: user.id }
  });
}
```

### 9. Use Database-Level Aggregations

Use database-level aggregations instead of application-level aggregations:

```typescript
// Good: Uses database-level aggregation
const counts = await prisma.metadata.groupBy({
  by: ['dataType'],
  _count: true
});

// Bad: Uses application-level aggregation
const metadata = await prisma.metadata.findMany();
const counts = metadata.reduce((acc, item) => {
  acc[item.dataType] = (acc[item.dataType] || 0) + 1;
  return acc;
}, {});
```

### 10. Use Raw Queries for Complex Operations

Use raw queries for complex operations that can't be expressed with Prisma's query API:

```typescript
// Good: Uses raw query for complex operation
const result = await prisma.$queryRaw`
  SELECT "dataType", COUNT(*) as count
  FROM "Metadata"
  WHERE "createdAt" >= ${startDate}
  GROUP BY "dataType"
  ORDER BY count DESC
`;

// Bad: Uses multiple queries and application logic
const metadata = await prisma.metadata.findMany({
  where: { createdAt: { gte: startDate } }
});
const counts = metadata.reduce((acc, item) => {
  acc[item.dataType] = (acc[item.dataType] || 0) + 1;
  return acc;
}, {});
const sorted = Object.entries(counts)
  .sort((a, b) => b[1] - a[1])
  .map(([dataType, count]) => ({ dataType, count }));
```

## Monitoring and Optimization

### Query Monitoring

Monitor query performance using Prisma's logging capabilities:

```typescript
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

prisma.$on('query', (e) => {
  console.log(`Query: ${e.query}`);
  console.log(`Duration: ${e.duration}ms`);
});
```

### Performance Testing

Regularly test query performance with realistic data volumes:

1. Create a test database with a realistic data volume
2. Run performance tests on common query patterns
3. Identify and optimize slow queries
4. Monitor performance over time to detect regressions

## Conclusion

Following these query optimization techniques will ensure that the NGDI Portal database performs efficiently, even with large data volumes. Regularly monitor query performance and optimize slow queries to maintain good application performance.
