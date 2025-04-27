-- Optimize Metadata model by adding indexes and using JSON fields for flexible data

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS "Metadata_title_idx" ON "Metadata" USING gin (to_tsvector('english', "title"));
CREATE INDEX IF NOT EXISTS "Metadata_abstract_idx" ON "Metadata" USING gin (to_tsvector('english', "abstract"));
CREATE INDEX IF NOT EXISTS "Metadata_dataName_idx" ON "Metadata" USING gin (to_tsvector('english', "dataName"));
CREATE INDEX IF NOT EXISTS "Metadata_categories_idx" ON "Metadata" USING gin ("categories");
CREATE INDEX IF NOT EXISTS "Metadata_frameworkType_idx" ON "Metadata" ("frameworkType");
CREATE INDEX IF NOT EXISTS "Metadata_dataType_idx" ON "Metadata" ("dataType");
CREATE INDEX IF NOT EXISTS "Metadata_organization_idx" ON "Metadata" ("organization");
CREATE INDEX IF NOT EXISTS "Metadata_country_idx" ON "Metadata" ("country");
CREATE INDEX IF NOT EXISTS "Metadata_state_idx" ON "Metadata" ("state");
CREATE INDEX IF NOT EXISTS "Metadata_fileFormat_idx" ON "Metadata" ("fileFormat");
CREATE INDEX IF NOT EXISTS "Metadata_validationStatus_idx" ON "Metadata" ("validationStatus");
CREATE INDEX IF NOT EXISTS "Metadata_assessment_idx" ON "Metadata" ("assessment");

-- Add spatial index for bounding box queries
CREATE INDEX IF NOT EXISTS "Metadata_spatial_idx" ON "Metadata" USING gist (
  ST_MakeEnvelope("minLongitude", "minLatitude", "maxLongitude", "maxLatitude", 4326)
);

-- Add combined index for date range queries
CREATE INDEX IF NOT EXISTS "Metadata_date_range_idx" ON "Metadata" ("dateFrom", "dateTo");

-- Add combined index for production date
CREATE INDEX IF NOT EXISTS "Metadata_production_date_idx" ON "Metadata" ("productionDate");

-- Add combined index for update frequency
CREATE INDEX IF NOT EXISTS "Metadata_update_frequency_idx" ON "Metadata" ("updateFrequency");

-- Add combined index for metadata creation and review dates
CREATE INDEX IF NOT EXISTS "Metadata_metadata_dates_idx" ON "Metadata" ("metadataCreationDate", "metadataReviewDate");
