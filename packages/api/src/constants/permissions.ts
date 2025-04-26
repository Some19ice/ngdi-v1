/**
 * Permission constants for the application
 * These are used to define permissions in a consistent way
 */

// Metadata permissions
export const METADATA_CREATE = { action: "create", subject: "metadata" }
export const METADATA_READ = { action: "read", subject: "metadata" }
export const METADATA_UPDATE = { action: "update", subject: "metadata" }
export const METADATA_DELETE = { action: "delete", subject: "metadata" }
export const METADATA_APPROVE = { action: "approve", subject: "metadata" }
export const METADATA_REJECT = { action: "reject", subject: "metadata" }
export const METADATA_PUBLISH = { action: "publish", subject: "metadata" }
export const METADATA_UNPUBLISH = { action: "unpublish", subject: "metadata" }
export const METADATA_IMPORT = { action: "import", subject: "metadata" }
export const METADATA_EXPORT = { action: "export", subject: "metadata" }
export const METADATA_SUBMIT_FOR_REVIEW = {
  action: "submit-for-review",
  subject: "metadata",
}
export const METADATA_VALIDATE = { action: "validate", subject: "metadata" }
export const METADATA_BULK_EDIT = { action: "bulk-edit", subject: "metadata" }
export const METADATA_ASSIGN_REVIEWER = {
  action: "assign-reviewer",
  subject: "metadata",
}

// User permissions
export const USER_CREATE = { action: "create", subject: "user" }
export const USER_READ = { action: "read", subject: "user" }
export const USER_UPDATE = { action: "update", subject: "user" }
export const USER_DELETE = { action: "delete", subject: "user" }
export const USER_MANAGE_ROLES = { action: "manage-roles", subject: "user" }

// Role permissions
export const ROLE_CREATE = { action: "create", subject: "role" }
export const ROLE_READ = { action: "read", subject: "role" }
export const ROLE_UPDATE = { action: "update", subject: "role" }
export const ROLE_DELETE = { action: "delete", subject: "role" }
export const ROLE_ASSIGN = { action: "assign", subject: "role" }

// Permission permissions
export const PERMISSION_CREATE = { action: "create", subject: "permission" }
export const PERMISSION_READ = { action: "read", subject: "permission" }
export const PERMISSION_UPDATE = { action: "update", subject: "permission" }
export const PERMISSION_DELETE = { action: "delete", subject: "permission" }
export const PERMISSION_ASSIGN = { action: "assign", subject: "permission" }

// System permissions
export const SYSTEM_SETTINGS = { action: "manage", subject: "settings" }
export const SYSTEM_LOGS = { action: "view", subject: "logs" }
export const SYSTEM_BACKUP = { action: "manage", subject: "backup" }

// Dashboard permissions
export const DASHBOARD_VIEW = { action: "view", subject: "dashboard" }
export const DASHBOARD_ANALYTICS = { action: "view", subject: "analytics" }
export const DASHBOARD_REPORTS = { action: "view", subject: "reports" }

// Organization permissions
export const ORGANIZATION_CREATE = { action: "create", subject: "organization" }
export const ORGANIZATION_READ = { action: "read", subject: "organization" }
export const ORGANIZATION_UPDATE = { action: "update", subject: "organization" }
export const ORGANIZATION_DELETE = { action: "delete", subject: "organization" }
export const ORGANIZATION_MANAGE_MEMBERS = {
  action: "manage-members",
  subject: "organization",
}

// Permission groups
export const METADATA_MANAGEMENT = [
  METADATA_CREATE,
  METADATA_READ,
  METADATA_UPDATE,
  METADATA_DELETE,
  METADATA_APPROVE,
  METADATA_REJECT,
  METADATA_PUBLISH,
  METADATA_UNPUBLISH,
  METADATA_IMPORT,
  METADATA_EXPORT,
  METADATA_SUBMIT_FOR_REVIEW,
  METADATA_VALIDATE,
  METADATA_BULK_EDIT,
  METADATA_ASSIGN_REVIEWER,
]

// More granular metadata permission groups
export const METADATA_AUTHOR_PERMISSIONS = [
  METADATA_CREATE,
  METADATA_READ,
  METADATA_UPDATE,
  METADATA_SUBMIT_FOR_REVIEW,
]

export const METADATA_REVIEWER_PERMISSIONS = [
  METADATA_READ,
  METADATA_VALIDATE,
  METADATA_APPROVE,
  METADATA_REJECT,
]

export const METADATA_PUBLISHER_PERMISSIONS = [
  METADATA_READ,
  METADATA_PUBLISH,
  METADATA_UNPUBLISH,
]

export const METADATA_ADMIN_PERMISSIONS = [
  ...METADATA_MANAGEMENT,
  METADATA_ASSIGN_REVIEWER,
]

export const USER_MANAGEMENT = [
  USER_CREATE,
  USER_READ,
  USER_UPDATE,
  USER_DELETE,
  USER_MANAGE_ROLES,
]

export const ROLE_MANAGEMENT = [
  ROLE_CREATE,
  ROLE_READ,
  ROLE_UPDATE,
  ROLE_DELETE,
  ROLE_ASSIGN,
]

export const PERMISSION_MANAGEMENT = [
  PERMISSION_CREATE,
  PERMISSION_READ,
  PERMISSION_UPDATE,
  PERMISSION_DELETE,
  PERMISSION_ASSIGN,
]

export const SYSTEM_ADMINISTRATION = [
  SYSTEM_SETTINGS,
  SYSTEM_LOGS,
  SYSTEM_BACKUP,
]

export const DASHBOARD_ACCESS = [
  DASHBOARD_VIEW,
  DASHBOARD_ANALYTICS,
  DASHBOARD_REPORTS,
]

export const ORGANIZATION_MANAGEMENT = [
  ORGANIZATION_CREATE,
  ORGANIZATION_READ,
  ORGANIZATION_UPDATE,
  ORGANIZATION_DELETE,
  ORGANIZATION_MANAGE_MEMBERS,
]

// Role permission sets
export const ADMIN_PERMISSIONS = [
  ...METADATA_MANAGEMENT,
  ...USER_MANAGEMENT,
  ...ROLE_MANAGEMENT,
  ...PERMISSION_MANAGEMENT,
  ...SYSTEM_ADMINISTRATION,
  ...DASHBOARD_ACCESS,
  ...ORGANIZATION_MANAGEMENT,
]

export const NODE_OFFICER_PERMISSIONS = [
  ...METADATA_REVIEWER_PERMISSIONS,
  ...METADATA_PUBLISHER_PERMISSIONS,
  METADATA_IMPORT,
  METADATA_EXPORT,
  METADATA_VALIDATE,
  USER_READ,
  USER_CREATE,
  DASHBOARD_VIEW,
  DASHBOARD_ANALYTICS,
  DASHBOARD_REPORTS,
  ORGANIZATION_READ,
  ORGANIZATION_UPDATE,
]

export const USER_PERMISSIONS = [
  ...METADATA_AUTHOR_PERMISSIONS,
  DASHBOARD_VIEW
]

export const GUEST_PERMISSIONS = [METADATA_READ]
