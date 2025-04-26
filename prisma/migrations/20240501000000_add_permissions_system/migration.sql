-- Create new Permission model
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "action" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "conditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- Create new Role model
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- Create RolePermission junction table
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- Create UserPermission junction table for direct user permissions
CREATE TABLE "UserPermission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "conditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- Create PermissionGroup model for organizing permissions
CREATE TABLE "PermissionGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermissionGroup_pkey" PRIMARY KEY ("id")
);

-- Create PermissionGroupItem junction table
CREATE TABLE "PermissionGroupItem" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PermissionGroupItem_pkey" PRIMARY KEY ("id")
);

-- Create ActivityLog model for activity-based permissions
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "subjectId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- Add roleId to User model
ALTER TABLE "User" ADD COLUMN "roleId" TEXT;

-- Create unique constraints
CREATE UNIQUE INDEX "Permission_action_subject_key" ON "Permission"("action", "subject");
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
CREATE UNIQUE INDEX "PermissionGroup_name_key" ON "PermissionGroup"("name");
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");
CREATE UNIQUE INDEX "UserPermission_userId_permissionId_key" ON "UserPermission"("userId", "permissionId");
CREATE UNIQUE INDEX "PermissionGroupItem_groupId_permissionId_key" ON "PermissionGroupItem"("groupId", "permissionId");

-- Create foreign key constraints
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PermissionGroupItem" ADD CONSTRAINT "PermissionGroupItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PermissionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PermissionGroupItem" ADD CONSTRAINT "PermissionGroupItem_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes for performance
CREATE INDEX "Permission_action_subject_idx" ON "Permission"("action", "subject");
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");
CREATE INDEX "UserPermission_userId_idx" ON "UserPermission"("userId");
CREATE INDEX "UserPermission_permissionId_idx" ON "UserPermission"("permissionId");
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");
CREATE INDEX "ActivityLog_action_subject_idx" ON "ActivityLog"("action", "subject");
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- Insert default system roles
INSERT INTO "Role" ("id", "name", "description", "isSystem", "createdAt", "updatedAt")
VALUES 
('role_admin', 'Admin', 'System administrator with full access', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('role_node_officer', 'Node Officer', 'Node officer with specific privileges', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('role_user', 'User', 'Regular user with basic access', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('role_guest', 'Guest', 'Guest user with limited access', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Migrate existing users to new role system
UPDATE "User" SET "roleId" = 'role_admin' WHERE "role" = 'ADMIN';
UPDATE "User" SET "roleId" = 'role_node_officer' WHERE "role" = 'NODE_OFFICER';
UPDATE "User" SET "roleId" = 'role_user' WHERE "role" = 'USER';

-- Create permission groups
INSERT INTO "PermissionGroup" ("id", "name", "description", "createdAt", "updatedAt")
VALUES 
('group_metadata', 'Metadata Management', 'Permissions for managing metadata', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('group_users', 'User Management', 'Permissions for managing users', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('group_system', 'System Management', 'Permissions for managing system settings', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('group_dashboard', 'Dashboard', 'Permissions for dashboard features', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
