/*
  Warnings:

  - Made the column `updateCycle` on table `Metadata` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Metadata" ALTER COLUMN "updateCycle" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Metadata_organization_idx" ON "Metadata"("organization");

-- CreateIndex
CREATE INDEX "Metadata_frameworkType_idx" ON "Metadata"("frameworkType");

-- CreateIndex
CREATE INDEX "Metadata_createdAt_idx" ON "Metadata"("createdAt");

-- CreateIndex
CREATE INDEX "Metadata_title_idx" ON "Metadata"("title");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_organization_idx" ON "User"("organization");
