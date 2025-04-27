# Database Entity-Relationship Diagram

This document provides an entity-relationship diagram for the NGDI Portal database.

## Overview

The NGDI Portal database consists of several interconnected entities that represent the core functionality of the application. The main entities are:

1. **User**: Represents a user of the system
2. **Metadata**: Represents geospatial metadata information
3. **Role**: Represents a user role with associated permissions
4. **Permission**: Represents a permission that can be assigned to roles or users
5. **SecurityLog**: Represents a security event log
6. **ActivityLog**: Represents a user activity log

## Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Metadata : creates
    User ||--o{ Session : has
    User ||--o{ Account : has
    User ||--o{ Draft : has
    User ||--o{ SecurityLog : generates
    User ||--o{ ActivityLog : performs
    User ||--o{ UserPermission : has
    User }o--|| Role : assigned

    Role ||--o{ RolePermission : has
    Permission ||--o{ RolePermission : assigned_to
    Permission ||--o{ UserPermission : assigned_to
    Permission ||--o{ PermissionGroupItem : included_in
    PermissionGroup ||--o{ PermissionGroupItem : contains

    User {
        string id PK
        string name
        string email
        datetime emailVerified
        string image
        string password
        enum role
        string roleId FK
        string organization
        string department
        string phone
        boolean locked
        datetime lockedUntil
        int failedAttempts
        datetime lastFailedAttempt
        datetime createdAt
        datetime updatedAt
    }

    Metadata {
        string id PK
        string title
        string dataName
        string dataType
        string abstract
        string purpose
        string productionDate
        string organization
        string author
        string[] categories
        string frameworkType
        string thumbnailUrl
        string imageName
        string dateFrom
        string dateTo
        string updateFrequency
        string validationStatus
        string assessment
        string coordinateUnit
        float minLatitude
        float minLongitude
        float maxLatitude
        float maxLongitude
        string coordinateSystem
        string projection
        int scale
        string resolution
        string fileFormat
        bigint fileSize
        int numFeatures
        string distributionFormat
        string accessMethod
        string downloadUrl
        string apiEndpoint
        string licenseType
        string usageTerms
        string attributionRequirements
        string[] accessRestrictions
        json locationInfo
        json qualityInfo
        json contactInfo
        json metadataReferenceInfo
        json dataQualityInfo
        json dataProcessingInfo
        json distributionDetails
        json legacyFields
        json fundamentalDatasets
        string userId FK
        datetime createdAt
        datetime updatedAt
    }

    Account {
        string id PK
        string userId FK
        string type
        string provider
        string providerAccountId
        string refresh_token
        string access_token
        int expires_at
        string token_type
        string scope
        string id_token
        string session_state
    }

    Session {
        string id PK
        string sessionToken
        string userId FK
        datetime expires
    }

    VerificationToken {
        string identifier
        string token
        datetime expires
    }

    Settings {
        string id PK
        string siteName
        string siteDescription
        string supportEmail
        int maxUploadSize
        string defaultLanguage
        boolean maintenanceMode
        boolean enableRegistration
        boolean requireEmailVerification
        boolean metadataValidation
        boolean autoBackup
        string backupFrequency
        string storageProvider
        int apiRateLimit
        datetime updatedAt
    }

    Draft {
        string id PK
        string userId FK
        string title
        json data
        string lastUpdated
        datetime createdAt
    }

    FailedLogin {
        string email PK
        int attempts
        string ipAddress
        string userAgent
        datetime lockedUntil
        datetime firstAttempt
        datetime lastAttempt
        datetime resetAt
    }

    SecurityLog {
        string id PK
        string userId FK
        string email
        string eventType
        string ipAddress
        string userAgent
        string deviceId
        string details
        datetime createdAt
    }

    Role {
        string id PK
        string name
        string description
        boolean isSystem
        datetime createdAt
        datetime updatedAt
    }

    Permission {
        string id PK
        string name
        string description
        string action
        string subject
        json conditions
        datetime createdAt
        datetime updatedAt
    }

    RolePermission {
        string id PK
        string roleId FK
        string permissionId FK
        datetime createdAt
    }

    UserPermission {
        string id PK
        string userId FK
        string permissionId FK
        boolean granted
        json conditions
        datetime createdAt
        datetime expiresAt
    }

    PermissionGroup {
        string id PK
        string name
        string description
        datetime createdAt
        datetime updatedAt
    }

    PermissionGroupItem {
        string id PK
        string groupId FK
        string permissionId FK
        datetime createdAt
    }

    ActivityLog {
        string id PK
        string userId FK
        string action
        string subject
        string subjectId
        json metadata
        string ipAddress
        string userAgent
        datetime createdAt
    }
```

## Entity Relationships

### User Relationships

- **User to Metadata**: One-to-many relationship. A user can create multiple metadata entries.
- **User to Session**: One-to-many relationship. A user can have multiple sessions.
- **User to Account**: One-to-many relationship. A user can have multiple OAuth accounts.
- **User to Draft**: One-to-many relationship. A user can have multiple drafts.
- **User to SecurityLog**: One-to-many relationship. A user can generate multiple security logs.
- **User to ActivityLog**: One-to-many relationship. A user can perform multiple activities.
- **User to UserPermission**: One-to-many relationship. A user can have multiple direct permissions.
- **User to Role**: Many-to-one relationship. Many users can be assigned to a single role.

### Role and Permission Relationships

- **Role to RolePermission**: One-to-many relationship. A role can have multiple permissions.
- **Permission to RolePermission**: One-to-many relationship. A permission can be assigned to multiple roles.
- **Permission to UserPermission**: One-to-many relationship. A permission can be assigned to multiple users directly.
- **Permission to PermissionGroupItem**: One-to-many relationship. A permission can be included in multiple permission groups.
- **PermissionGroup to PermissionGroupItem**: One-to-many relationship. A permission group can contain multiple permissions.

## Key Entities

### User Entity

The User entity represents a user of the system. It contains information about the user's identity, authentication, and role.

### Metadata Entity

The Metadata entity represents geospatial metadata information. It contains detailed information about geospatial datasets, including their properties, location, quality, and distribution details.

### Role and Permission Entities

The Role and Permission entities implement a comprehensive permission system. Roles are assigned to users, and permissions are assigned to roles. Permissions can also be assigned directly to users through the UserPermission entity.

### Log Entities

The SecurityLog and ActivityLog entities track security events and user activities. They provide an audit trail for security and compliance purposes.

## Conclusion

This entity-relationship diagram provides a comprehensive view of the NGDI Portal database structure. It shows the relationships between entities and the attributes of each entity.
