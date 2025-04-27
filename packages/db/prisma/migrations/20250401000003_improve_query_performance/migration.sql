-- Add additional indexes for query performance

-- Add full-text search indexes for Metadata
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes for text search on Metadata
CREATE INDEX IF NOT EXISTS "idx_Metadata_title_trgm" ON "Metadata" USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_Metadata_abstract_trgm" ON "Metadata" USING gin (abstract gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_Metadata_dataName_trgm" ON "Metadata" USING gin ("dataName" gin_trgm_ops);

-- Create indexes for JSON fields
CREATE INDEX IF NOT EXISTS "idx_Metadata_locationInfo" ON "Metadata" USING gin ("locationInfo");
CREATE INDEX IF NOT EXISTS "idx_Metadata_qualityInfo" ON "Metadata" USING gin ("qualityInfo");
CREATE INDEX IF NOT EXISTS "idx_Metadata_contactInfo" ON "Metadata" USING gin ("contactInfo");
CREATE INDEX IF NOT EXISTS "idx_Metadata_metadataReferenceInfo" ON "Metadata" USING gin ("metadataReferenceInfo");
CREATE INDEX IF NOT EXISTS "idx_Metadata_dataQualityInfo" ON "Metadata" USING gin ("dataQualityInfo");
CREATE INDEX IF NOT EXISTS "idx_Metadata_dataProcessingInfo" ON "Metadata" USING gin ("dataProcessingInfo");
CREATE INDEX IF NOT EXISTS "idx_Metadata_distributionDetails" ON "Metadata" USING gin ("distributionDetails");
CREATE INDEX IF NOT EXISTS "idx_Metadata_fundamentalDatasets" ON "Metadata" USING gin ("fundamentalDatasets");

-- Create indexes for SecurityLog and ActivityLog for faster filtering
CREATE INDEX IF NOT EXISTS "idx_SecurityLog_eventType_createdAt" ON "SecurityLog" ("eventType", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_ActivityLog_action_subject_createdAt" ON "ActivityLog" ("action", "subject", "createdAt");

-- Create indexes for User filtering
CREATE INDEX IF NOT EXISTS "idx_User_organization" ON "User" ("organization");
CREATE INDEX IF NOT EXISTS "idx_User_department" ON "User" ("department");
CREATE INDEX IF NOT EXISTS "idx_User_role" ON "User" ("role");
CREATE INDEX IF NOT EXISTS "idx_User_locked" ON "User" ("locked");

-- Create indexes for Permission filtering
CREATE INDEX IF NOT EXISTS "idx_Permission_action" ON "Permission" ("action");
CREATE INDEX IF NOT EXISTS "idx_Permission_subject" ON "Permission" ("subject");

-- Create indexes for Draft filtering
CREATE INDEX IF NOT EXISTS "idx_Draft_title" ON "Draft" ("title");
CREATE INDEX IF NOT EXISTS "idx_Draft_createdAt" ON "Draft" ("createdAt");

-- Create indexes for FailedLogin
CREATE INDEX IF NOT EXISTS "idx_FailedLogin_attempts" ON "FailedLogin" ("attempts");
CREATE INDEX IF NOT EXISTS "idx_FailedLogin_lockedUntil" ON "FailedLogin" ("lockedUntil");

-- Create materialized view for metadata statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS "metadata_stats" AS
SELECT
  "dataType",
  COUNT(*) AS count,
  MIN("createdAt") AS first_created,
  MAX("createdAt") AS last_created,
  COUNT(DISTINCT "userId") AS unique_users,
  COUNT(DISTINCT "organization") AS unique_organizations,
  COUNT(DISTINCT "fileFormat") AS unique_file_formats
FROM "Metadata"
GROUP BY "dataType";

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS "idx_metadata_stats_dataType" ON "metadata_stats" ("dataType");

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_metadata_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW "metadata_stats";
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh the materialized view when metadata is modified
DROP TRIGGER IF EXISTS refresh_metadata_stats_trigger ON "Metadata";
CREATE TRIGGER refresh_metadata_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON "Metadata"
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_metadata_stats();
