# Granular Permissions System

This document describes the granular permissions system implemented in the application.

## Overview

The permissions system provides:

1. **Specific permissions for admin dashboard features**
2. **Role-based access control with custom roles**
3. **Permission inheritance and composition**
4. **Activity-based permissions**

## Core Concepts

### Permissions

A permission is a combination of an action and a subject, optionally with conditions. For example:

- `create:metadata` - Permission to create metadata records
- `read:user` - Permission to read user information
- `manage:settings` - Permission to manage system settings

Permissions can have conditions that further restrict when they apply:

- Organization-specific permissions
- User-specific permissions (ownership)
- Dynamic conditions based on resource attributes

### Roles

Roles are collections of permissions. The system includes default roles:

- **Admin**: Full access to all features
- **Node Officer**: Access to metadata management and limited user management
- **User**: Basic access to create and view metadata
- **Guest**: Read-only access to metadata

Custom roles can be created with specific sets of permissions.

### Permission Groups

Permission groups organize related permissions. Default groups include:

- **Metadata Management**: Permissions for managing metadata
- **User Management**: Permissions for managing users
- **Role Management**: Permissions for managing roles
- **Permission Management**: Permissions for managing permissions
- **System Administration**: Permissions for system administration
- **Dashboard Access**: Permissions for dashboard access
- **Organization Management**: Permissions for managing organizations

### Activity-Based Permissions

Activity-based permissions grant access based on user activity. For example:

- Requiring a user to have performed a specific action recently
- Granting temporary permissions based on activity patterns
- Revoking permissions after periods of inactivity

## Database Schema

The permissions system uses the following database models:

- **Permission**: Defines individual permissions
- **Role**: Defines roles that group permissions
- **RolePermission**: Junction table linking roles to permissions
- **UserPermission**: Direct permissions assigned to users
- **PermissionGroup**: Groups of related permissions
- **PermissionGroupItem**: Junction table linking groups to permissions
- **ActivityLog**: Records user activities for activity-based permissions

## API Endpoints

### Permissions

- `GET /permissions` - List all permissions
- `GET /permissions/:id` - Get permission by ID
- `POST /permissions` - Create a new permission
- `PUT /permissions/:id` - Update a permission
- `DELETE /permissions/:id` - Delete a permission
- `GET /permissions/subject/:subject` - Get permissions by subject
- `GET /permissions/action/:action` - Get permissions by action

### Roles

- `GET /roles` - List all roles
- `GET /roles/:id` - Get role by ID with its permissions
- `POST /roles` - Create a new role
- `PUT /roles/:id` - Update a role
- `DELETE /roles/:id` - Delete a role
- `POST /roles/assign/:roleId/user/:userId` - Assign a role to a user
- `GET /roles/:id/users` - Get users with a specific role

### User Permissions

- `GET /user-permissions/user/:userId` - Get permissions for a user
- `POST /user-permissions/user/:userId` - Grant a permission to a user
- `DELETE /user-permissions/user/:userId/permission/:permissionId` - Revoke a permission from a user
- `POST /user-permissions/check` - Check if a user has a specific permission

### Permission Groups

- `GET /permission-groups` - List all permission groups
- `GET /permission-groups/:id` - Get permission group by ID with its permissions
- `POST /permission-groups` - Create a new permission group
- `PUT /permission-groups/:id` - Update a permission group
- `DELETE /permission-groups/:id` - Delete a permission group

### Activity Logs

- `GET /activity-logs` - List activity logs with pagination and filtering
- `GET /activity-logs/:id` - Get activity log by ID
- `GET /activity-logs/user/:userId` - Get activity logs for a specific user
- `GET /activity-logs/resource/:subject/:subjectId` - Get activity logs for a specific resource
- `GET /activity-logs/summary` - Get activity summary statistics

## Middleware

The system provides middleware for permission checks:

- `requirePermission(action, subject)` - Require a specific permission
- `requireAllPermissions(permissions)` - Require all specified permissions
- `requireAnyPermission(permissions)` - Require any of the specified permissions
- `requireOwnership(subject, getUserIdFromResource)` - Require ownership of a resource
- `requireActivity(action, subject, lookbackHours)` - Require recent activity

## Usage Examples

### Checking Permissions

```typescript
// Check if a user has a specific permission
const result = await hasPermission(user, 'create', 'metadata');
if (result.granted) {
  // User has permission
} else {
  // User does not have permission
  console.log(result.reason);
}

// Check if a user has all specified permissions
const result = await hasAllPermissions(user, [
  { action: 'create', subject: 'metadata' },
  { action: 'publish', subject: 'metadata' }
]);

// Check if a user has any of the specified permissions
const result = await hasAnyPermission(user, [
  { action: 'create', subject: 'metadata' },
  { action: 'update', subject: 'metadata' }
]);
```

### Using Middleware

```typescript
// Require a specific permission
app.get('/metadata', requirePermission('read', 'metadata'), (c) => {
  // Handler code
});

// Require all specified permissions
app.post('/metadata/publish', requireAllPermissions([
  { action: 'update', subject: 'metadata' },
  { action: 'publish', subject: 'metadata' }
]), (c) => {
  // Handler code
});

// Require any of the specified permissions
app.put('/metadata/:id', requireAnyPermission([
  { action: 'update', subject: 'metadata' },
  { action: 'admin', subject: 'metadata' }
]), (c) => {
  // Handler code
});

// Require ownership of a resource
app.delete('/metadata/:id', requireOwnership('metadata', async (c) => {
  const metadata = await prisma.metadata.findUnique({
    where: { id: c.req.param('id') }
  });
  return metadata?.userId || '';
}), (c) => {
  // Handler code
});

// Require recent activity
app.post('/metadata/approve', requireActivity('review', 'metadata', 24), (c) => {
  // Handler code
});
```

### Granting and Revoking Permissions

```typescript
// Grant a permission to a user
await grantPermissionToUser(userId, permissionId, {
  organizationId: 'org123'
}, new Date(Date.now() + 86400000)); // Expires in 24 hours

// Revoke a permission from a user
await revokePermissionFromUser(userId, permissionId);
```

## Best Practices

1. **Use Constants**: Use the permission constants defined in `constants/permissions.ts` instead of hardcoding permission strings.

2. **Check Ownership**: When possible, use ownership checks to restrict access to resources.

3. **Log Permission Checks**: Use the `logPermissionCheck` function to log permission checks for auditing.

4. **Use Permission Groups**: Organize permissions into logical groups for easier management.

5. **Prefer Specific Permissions**: Use specific permissions instead of broad ones to follow the principle of least privilege.

6. **Consider Expiration**: Use expiration dates for temporary permissions.

7. **Activity-Based Permissions**: Use activity-based permissions for sensitive operations that require recent engagement.

## Migration from Legacy Role System

The system maintains backward compatibility with the legacy role system:

- The `User` model retains the `role` field while adding a `roleId` field for the new system.
- The `adminMiddleware` checks both legacy and new roles.
- The `requireRole` middleware supports both legacy and custom roles.
- The `requireAnyRole` middleware supports both legacy and custom roles.

To migrate a user to the new system:

```typescript
// Get the role
const role = await prisma.role.findUnique({
  where: { name: 'Admin' }
});

// Update the user
await prisma.user.update({
  where: { id: userId },
  data: { roleId: role.id }
});
```
