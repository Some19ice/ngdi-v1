-- Update Metadata model to use JSON fields for flexible data

-- Create temporary table to store existing data
CREATE TEMPORARY TABLE temp_metadata AS
SELECT * FROM "Metadata";

-- Add new JSON columns
ALTER TABLE "Metadata" ADD COLUMN "locationInfo" JSONB;
ALTER TABLE "Metadata" ADD COLUMN "qualityInfo" JSONB;
ALTER TABLE "Metadata" ADD COLUMN "contactInfo" JSONB;
ALTER TABLE "Metadata" ADD COLUMN "metadataReferenceInfo" JSONB;
ALTER TABLE "Metadata" ADD COLUMN "dataQualityInfo" JSONB;
ALTER TABLE "Metadata" ADD COLUMN "dataProcessingInfo" JSONB;
ALTER TABLE "Metadata" ADD COLUMN "distributionDetails" JSONB;
ALTER TABLE "Metadata" ADD COLUMN "legacyFields" JSONB;

-- Update locationInfo JSON column
UPDATE "Metadata" SET "locationInfo" = jsonb_build_object(
  'country', "country",
  'geopoliticalZone', "geopoliticalZone",
  'state', "state",
  'lga', "lga",
  'townCity', "townCity"
);

-- Update qualityInfo JSON column
UPDATE "Metadata" SET "qualityInfo" = jsonb_build_object(
  'accuracyLevel', "accuracyLevel",
  'completeness', "completeness",
  'consistencyCheck', "consistencyCheck"
);

-- Update contactInfo JSON column
UPDATE "Metadata" SET "contactInfo" = jsonb_build_object(
  'contactPerson', "contactPerson",
  'email', "email",
  'department', "department"
);

-- Update metadataReferenceInfo JSON column
UPDATE "Metadata" SET "metadataReferenceInfo" = jsonb_build_object(
  'metadataCreationDate', "metadataCreationDate",
  'metadataReviewDate', "metadataReviewDate",
  'metadataContactName', "metadataContactName",
  'metadataContactAddress', "metadataContactAddress",
  'metadataContactEmail', "metadataContactEmail",
  'metadataContactPhone', "metadataContactPhone"
);

-- Update dataQualityInfo JSON column
UPDATE "Metadata" SET "dataQualityInfo" = jsonb_build_object(
  'logicalConsistencyReport', "logicalConsistencyReport",
  'completenessReport', "completenessReport",
  'attributeAccuracyReport', "attributeAccuracyReport",
  'positionalAccuracy', "positionalAccuracy",
  'sourceInformation', "sourceInformation"
);

-- Update dataProcessingInfo JSON column
UPDATE "Metadata" SET "dataProcessingInfo" = jsonb_build_object(
  'processingDescription', "processingDescription",
  'softwareVersion', "softwareVersion",
  'processedDate', "processedDate",
  'processorName', "processorName",
  'processorEmail', "processorEmail",
  'processorAddress', "processorAddress"
);

-- Update distributionDetails JSON column
UPDATE "Metadata" SET "distributionDetails" = jsonb_build_object(
  'distributorName', "distributorName",
  'distributorAddress', "distributorAddress",
  'distributorEmail', "distributorEmail",
  'distributorPhone', "distributorPhone",
  'distributorWebLink', "distributorWebLink",
  'distributorSocialMedia', "distributorSocialMedia",
  'isCustodian', "isCustodian",
  'custodianName', "custodianName",
  'custodianContact', "custodianContact",
  'distributionLiability', "distributionLiability",
  'customOrderProcess', "customOrderProcess",
  'technicalPrerequisites', "technicalPrerequisites",
  'fees', "fees",
  'turnaroundTime', "turnaroundTime",
  'orderingInstructions', "orderingInstructions",
  'maximumResponseTime', "maximumResponseTime"
);

-- Update legacyFields JSON column
UPDATE "Metadata" SET "legacyFields" = jsonb_build_object(
  'softwareReqs', "softwareReqs",
  'updateCycle', "updateCycle",
  'lastUpdate', "lastUpdate",
  'nextUpdate', "nextUpdate",
  'accessConstraints', "accessConstraints",
  'useConstraints', "useConstraints",
  'otherConstraints', "otherConstraints"
);

-- Make dataName NOT NULL if it's NULL
UPDATE "Metadata" SET "dataName" = "title" WHERE "dataName" IS NULL;

-- Make dataType NOT NULL if it's NULL
UPDATE "Metadata" SET "dataType" = COALESCE("frameworkType", 'Unknown') WHERE "dataType" IS NULL;

-- Drop columns that are now stored in JSON fields
-- Note: We're keeping the core fields and only dropping the ones moved to JSON

-- Location columns
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "country";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "geopoliticalZone";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "state";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "lga";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "townCity";

-- Quality columns
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "accuracyLevel";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "completeness";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "consistencyCheck";

-- Contact columns (keeping the core ones)
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "contactPerson";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "email";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "department";

-- Metadata reference columns
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "metadataCreationDate";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "metadataReviewDate";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "metadataContactName";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "metadataContactAddress";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "metadataContactEmail";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "metadataContactPhone";

-- Data quality columns
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "logicalConsistencyReport";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "completenessReport";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "attributeAccuracyReport";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "positionalAccuracy";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "sourceInformation";

-- Data processing columns
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "processingDescription";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "softwareVersion";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "processedDate";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "processorName";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "processorEmail";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "processorAddress";

-- Distribution details columns
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "distributorName";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "distributorAddress";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "distributorEmail";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "distributorPhone";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "distributorWebLink";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "distributorSocialMedia";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "isCustodian";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "custodianName";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "custodianContact";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "distributionLiability";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "customOrderProcess";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "technicalPrerequisites";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "fees";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "turnaroundTime";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "orderingInstructions";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "maximumResponseTime";

-- Legacy columns
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "softwareReqs";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "updateCycle";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "lastUpdate";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "nextUpdate";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "accessConstraints";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "useConstraints";
ALTER TABLE "Metadata" DROP COLUMN IF EXISTS "otherConstraints";

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS "Metadata_title_idx" ON "Metadata" ("title");
CREATE INDEX IF NOT EXISTS "Metadata_dataName_idx" ON "Metadata" ("dataName");
CREATE INDEX IF NOT EXISTS "Metadata_dataType_idx" ON "Metadata" ("dataType");
CREATE INDEX IF NOT EXISTS "Metadata_organization_idx" ON "Metadata" ("organization");
CREATE INDEX IF NOT EXISTS "Metadata_frameworkType_idx" ON "Metadata" ("frameworkType");
CREATE INDEX IF NOT EXISTS "Metadata_fileFormat_idx" ON "Metadata" ("fileFormat");
CREATE INDEX IF NOT EXISTS "Metadata_validationStatus_idx" ON "Metadata" ("validationStatus");
CREATE INDEX IF NOT EXISTS "Metadata_assessment_idx" ON "Metadata" ("assessment");
CREATE INDEX IF NOT EXISTS "Metadata_date_range_idx" ON "Metadata" ("dateFrom", "dateTo");
CREATE INDEX IF NOT EXISTS "Metadata_productionDate_idx" ON "Metadata" ("productionDate");
CREATE INDEX IF NOT EXISTS "Metadata_updateFrequency_idx" ON "Metadata" ("updateFrequency");
CREATE INDEX IF NOT EXISTS "Metadata_categories_idx" ON "Metadata" USING gin ("categories");

-- Drop temporary table
DROP TABLE temp_metadata;
