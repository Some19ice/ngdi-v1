/*
  Warnings:

  - Made the column `updateCycle` on table `Metadata` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Metadata" ALTER COLUMN "dateFrom" SET DATA TYPE TEXT,
ALTER COLUMN "dateTo" SET DATA TYPE TEXT,
ALTER COLUMN "updateCycle" SET NOT NULL;

-- CreateTable
CREATE TABLE "NGDIMetadata" (
    "id" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "dataName" TEXT NOT NULL,
    "cloudCoverPercentage" TEXT,
    "productionDate" TEXT NOT NULL,
    "fundamentalDatasets" JSONB NOT NULL,
    "abstract" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "coordinateUnit" TEXT NOT NULL,
    "minLatitude" DOUBLE PRECISION NOT NULL,
    "minLongitude" DOUBLE PRECISION NOT NULL,
    "maxLatitude" DOUBLE PRECISION NOT NULL,
    "maxLongitude" DOUBLE PRECISION NOT NULL,
    "country" TEXT NOT NULL,
    "geopoliticalZone" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "lga" TEXT NOT NULL,
    "townCity" TEXT NOT NULL,
    "assessment" TEXT NOT NULL,
    "updateFrequency" TEXT NOT NULL,
    "accessConstraints" TEXT NOT NULL,
    "useConstraints" TEXT NOT NULL,
    "otherConstraints" TEXT NOT NULL,
    "metadataCreationDate" TEXT NOT NULL,
    "metadataReviewDate" TEXT NOT NULL,
    "metadataContactName" TEXT NOT NULL,
    "metadataContactAddress" TEXT NOT NULL,
    "metadataContactEmail" TEXT NOT NULL,
    "metadataContactPhone" TEXT NOT NULL,
    "logicalConsistencyReport" TEXT,
    "completenessReport" TEXT,
    "attributeAccuracyReport" TEXT,
    "positionalAccuracy" JSONB,
    "sourceInformation" JSONB,
    "processingDescription" TEXT NOT NULL,
    "softwareVersion" TEXT,
    "processedDate" TEXT NOT NULL,
    "processorName" TEXT NOT NULL,
    "processorEmail" TEXT NOT NULL,
    "processorAddress" TEXT NOT NULL,
    "distributorName" TEXT NOT NULL,
    "distributorAddress" TEXT NOT NULL,
    "distributorEmail" TEXT NOT NULL,
    "distributorPhone" TEXT NOT NULL,
    "distributorWebLink" TEXT,
    "distributorSocialMedia" TEXT,
    "isCustodian" BOOLEAN NOT NULL DEFAULT true,
    "custodianName" TEXT,
    "custodianContact" TEXT,
    "distributionLiability" TEXT NOT NULL,
    "customOrderProcess" TEXT NOT NULL,
    "technicalPrerequisites" TEXT NOT NULL,
    "fees" TEXT NOT NULL,
    "turnaroundTime" TEXT NOT NULL,
    "orderingInstructions" TEXT NOT NULL,
    "maximumResponseTime" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NGDIMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "siteDescription" TEXT NOT NULL,
    "supportEmail" TEXT NOT NULL,
    "maxUploadSize" INTEGER NOT NULL,
    "defaultLanguage" TEXT NOT NULL,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "enableRegistration" BOOLEAN NOT NULL DEFAULT true,
    "requireEmailVerification" BOOLEAN NOT NULL DEFAULT true,
    "metadataValidation" BOOLEAN NOT NULL DEFAULT true,
    "autoBackup" BOOLEAN NOT NULL DEFAULT true,
    "backupFrequency" TEXT NOT NULL,
    "storageProvider" TEXT NOT NULL,
    "apiRateLimit" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NGDIMetadata_userId_idx" ON "NGDIMetadata"("userId");

-- AddForeignKey
ALTER TABLE "NGDIMetadata" ADD CONSTRAINT "NGDIMetadata_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
