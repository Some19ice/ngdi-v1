-- Standardize naming conventions for the database schema

-- Rename indexes to follow the idx_Table_column naming convention
ALTER INDEX "Metadata_userId_idx" RENAME TO "idx_Metadata_userId";
ALTER INDEX "Metadata_title_idx" RENAME TO "idx_Metadata_title";
ALTER INDEX "Metadata_dataName_idx" RENAME TO "idx_Metadata_dataName";
ALTER INDEX "Metadata_dataType_idx" RENAME TO "idx_Metadata_dataType";
ALTER INDEX "Metadata_organization_idx" RENAME TO "idx_Metadata_organization";
ALTER INDEX "Metadata_frameworkType_idx" RENAME TO "idx_Metadata_frameworkType";
ALTER INDEX "Metadata_fileFormat_idx" RENAME TO "idx_Metadata_fileFormat";
ALTER INDEX "Metadata_validationStatus_idx" RENAME TO "idx_Metadata_validationStatus";
ALTER INDEX "Metadata_assessment_idx" RENAME TO "idx_Metadata_assessment";
ALTER INDEX "Metadata_date_range_idx" RENAME TO "idx_Metadata_dateFrom_dateTo";
ALTER INDEX "Metadata_productionDate_idx" RENAME TO "idx_Metadata_productionDate";
ALTER INDEX "Metadata_updateFrequency_idx" RENAME TO "idx_Metadata_updateFrequency";
ALTER INDEX "Metadata_categories_idx" RENAME TO "idx_Metadata_categories";
ALTER INDEX "Metadata_spatial_idx" RENAME TO "idx_Metadata_spatial";

ALTER INDEX "Account_userId_idx" RENAME TO "idx_Account_userId";
ALTER INDEX "Session_userId_idx" RENAME TO "idx_Session_userId";
ALTER INDEX "User_roleId_idx" RENAME TO "idx_User_roleId";
ALTER INDEX "Draft_userId_idx" RENAME TO "idx_Draft_userId";
ALTER INDEX "SecurityLog_userId_idx" RENAME TO "idx_SecurityLog_userId";
ALTER INDEX "SecurityLog_email_idx" RENAME TO "idx_SecurityLog_email";
ALTER INDEX "SecurityLog_eventType_idx" RENAME TO "idx_SecurityLog_eventType";
ALTER INDEX "SecurityLog_createdAt_idx" RENAME TO "idx_SecurityLog_createdAt";
ALTER INDEX "RolePermission_roleId_idx" RENAME TO "idx_RolePermission_roleId";
ALTER INDEX "RolePermission_permissionId_idx" RENAME TO "idx_RolePermission_permissionId";
ALTER INDEX "UserPermission_userId_idx" RENAME TO "idx_UserPermission_userId";
ALTER INDEX "UserPermission_permissionId_idx" RENAME TO "idx_UserPermission_permissionId";
ALTER INDEX "Permission_action_subject_idx" RENAME TO "idx_Permission_action_subject";
ALTER INDEX "PermissionGroupItem_groupId_idx" RENAME TO "idx_PermissionGroupItem_groupId";
ALTER INDEX "PermissionGroupItem_permissionId_idx" RENAME TO "idx_PermissionGroupItem_permissionId";
ALTER INDEX "ActivityLog_userId_idx" RENAME TO "idx_ActivityLog_userId";
ALTER INDEX "ActivityLog_action_subject_idx" RENAME TO "idx_ActivityLog_action_subject";
ALTER INDEX "ActivityLog_createdAt_idx" RENAME TO "idx_ActivityLog_createdAt";

-- Rename unique constraints to follow the uq_Table_column naming convention
ALTER TABLE "Account" RENAME CONSTRAINT "Account_provider_providerAccountId_key" TO "uq_Account_provider_providerAccountId";
ALTER TABLE "Session" RENAME CONSTRAINT "Session_sessionToken_key" TO "uq_Session_sessionToken";
ALTER TABLE "User" RENAME CONSTRAINT "User_email_key" TO "uq_User_email";
ALTER TABLE "VerificationToken" RENAME CONSTRAINT "VerificationToken_token_key" TO "uq_VerificationToken_token";
ALTER TABLE "VerificationToken" RENAME CONSTRAINT "VerificationToken_identifier_token_key" TO "uq_VerificationToken_identifier_token";
ALTER TABLE "Role" RENAME CONSTRAINT "Role_name_key" TO "uq_Role_name";
ALTER TABLE "Permission" RENAME CONSTRAINT "Permission_name_key" TO "uq_Permission_name";
ALTER TABLE "Permission" RENAME CONSTRAINT "Permission_action_subject_key" TO "uq_Permission_action_subject";
ALTER TABLE "RolePermission" RENAME CONSTRAINT "RolePermission_roleId_permissionId_key" TO "uq_RolePermission_roleId_permissionId";
ALTER TABLE "UserPermission" RENAME CONSTRAINT "UserPermission_userId_permissionId_key" TO "uq_UserPermission_userId_permissionId";
ALTER TABLE "PermissionGroup" RENAME CONSTRAINT "PermissionGroup_name_key" TO "uq_PermissionGroup_name";
ALTER TABLE "PermissionGroupItem" RENAME CONSTRAINT "PermissionGroupItem_groupId_permissionId_key" TO "uq_PermissionGroupItem_groupId_permissionId";

-- Rename primary key constraints to follow the pk_Table naming convention
ALTER TABLE "Account" RENAME CONSTRAINT "Account_pkey" TO "pk_Account";
ALTER TABLE "Session" RENAME CONSTRAINT "Session_pkey" TO "pk_Session";
ALTER TABLE "User" RENAME CONSTRAINT "User_pkey" TO "pk_User";
ALTER TABLE "Metadata" RENAME CONSTRAINT "Metadata_pkey" TO "pk_Metadata";
ALTER TABLE "VerificationToken" RENAME CONSTRAINT "VerificationToken_pkey" TO "pk_VerificationToken";
ALTER TABLE "Settings" RENAME CONSTRAINT "Settings_pkey" TO "pk_Settings";
ALTER TABLE "Draft" RENAME CONSTRAINT "Draft_pkey" TO "pk_Draft";
ALTER TABLE "FailedLogin" RENAME CONSTRAINT "FailedLogin_pkey" TO "pk_FailedLogin";
ALTER TABLE "SecurityLog" RENAME CONSTRAINT "SecurityLog_pkey" TO "pk_SecurityLog";
ALTER TABLE "Role" RENAME CONSTRAINT "Role_pkey" TO "pk_Role";
ALTER TABLE "Permission" RENAME CONSTRAINT "Permission_pkey" TO "pk_Permission";
ALTER TABLE "RolePermission" RENAME CONSTRAINT "RolePermission_pkey" TO "pk_RolePermission";
ALTER TABLE "UserPermission" RENAME CONSTRAINT "UserPermission_pkey" TO "pk_UserPermission";
ALTER TABLE "PermissionGroup" RENAME CONSTRAINT "PermissionGroup_pkey" TO "pk_PermissionGroup";
ALTER TABLE "PermissionGroupItem" RENAME CONSTRAINT "PermissionGroupItem_pkey" TO "pk_PermissionGroupItem";
ALTER TABLE "ActivityLog" RENAME CONSTRAINT "ActivityLog_pkey" TO "pk_ActivityLog";

-- Rename foreign key constraints to follow the fk_Table_column naming convention
ALTER TABLE "Account" RENAME CONSTRAINT "Account_userId_fkey" TO "fk_Account_userId";
ALTER TABLE "Session" RENAME CONSTRAINT "Session_userId_fkey" TO "fk_Session_userId";
ALTER TABLE "Metadata" RENAME CONSTRAINT "Metadata_userId_fkey" TO "fk_Metadata_userId";
ALTER TABLE "Draft" RENAME CONSTRAINT "Draft_userId_fkey" TO "fk_Draft_userId";
ALTER TABLE "SecurityLog" RENAME CONSTRAINT "SecurityLog_userId_fkey" TO "fk_SecurityLog_userId";
ALTER TABLE "User" RENAME CONSTRAINT "User_roleId_fkey" TO "fk_User_roleId";
ALTER TABLE "RolePermission" RENAME CONSTRAINT "RolePermission_roleId_fkey" TO "fk_RolePermission_roleId";
ALTER TABLE "RolePermission" RENAME CONSTRAINT "RolePermission_permissionId_fkey" TO "fk_RolePermission_permissionId";
ALTER TABLE "UserPermission" RENAME CONSTRAINT "UserPermission_userId_fkey" TO "fk_UserPermission_userId";
ALTER TABLE "UserPermission" RENAME CONSTRAINT "UserPermission_permissionId_fkey" TO "fk_UserPermission_permissionId";
ALTER TABLE "PermissionGroupItem" RENAME CONSTRAINT "PermissionGroupItem_groupId_fkey" TO "fk_PermissionGroupItem_groupId";
ALTER TABLE "PermissionGroupItem" RENAME CONSTRAINT "PermissionGroupItem_permissionId_fkey" TO "fk_PermissionGroupItem_permissionId";
ALTER TABLE "ActivityLog" RENAME CONSTRAINT "ActivityLog_userId_fkey" TO "fk_ActivityLog_userId";
