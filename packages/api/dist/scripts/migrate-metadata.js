"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
/**
 * This script migrates data from the NGDIMetadata table to the Metadata table
 * to consolidate both metadata storage systems into one.
 */
async function main() {
    console.log("Starting metadata consolidation migration...");
    try {
        // Get count of records in both tables
        const ngdiMetadataCount = await prisma_1.prisma.nGDIMetadata.count();
        const metadataCount = await prisma_1.prisma.metadata.count();
        console.log(`Found ${ngdiMetadataCount} records in NGDIMetadata table`);
        console.log(`Found ${metadataCount} records in Metadata table`);
        // Get all records from NGDIMetadata
        const ngdiRecords = await prisma_1.prisma.nGDIMetadata.findMany({
            include: {
                user: true, // Include user relation
            },
        });
        console.log(`Retrieved ${ngdiRecords.length} records from NGDIMetadata table`);
        // Track migration results
        let migratedCount = 0;
        let skippedCount = 0;
        const errors = [];
        // Process each record
        for (const record of ngdiRecords) {
            try {
                // Check if a record with similar title already exists in Metadata
                const existingMetadata = await prisma_1.prisma.metadata.findFirst({
                    where: {
                        title: record.dataName,
                    },
                });
                if (existingMetadata) {
                    console.log(`Skipping record with title "${record.dataName}" - already exists in Metadata table`);
                    skippedCount++;
                    continue;
                }
                // Convert NGDIMetadata record to Metadata format
                const metadataRecord = {
                    title: record.dataName,
                    author: record.user?.name || "NGDI",
                    organization: record.user?.organization ||
                        "Nigeria Geospatial Data Infrastructure",
                    dateFrom: record.productionDate || new Date().toISOString().split("T")[0],
                    dateTo: record.productionDate || new Date().toISOString().split("T")[0],
                    abstract: record.abstract || "",
                    purpose: record.purpose || "",
                    thumbnailUrl: record.thumbnailUrl || "",
                    imageName: `${record.dataName.toLowerCase().replace(/\s+/g, "-")}.png`,
                    frameworkType: record.dataType || "Vector",
                    categories: [record.dataType || "Vector"],
                    coordinateSystem: "WGS 84",
                    projection: "UTM Zone 32N",
                    scale: 50000,
                    resolution: null,
                    accuracyLevel: "Medium",
                    completeness: 100,
                    consistencyCheck: true,
                    validationStatus: "Validated",
                    fileFormat: "Shapefile",
                    fileSize: null,
                    distributionFormat: "Shapefile, GeoJSON",
                    accessMethod: "Direct Download",
                    downloadUrl: null,
                    apiEndpoint: null,
                    licenseType: "NGDI Open Data License",
                    usageTerms: "Attribution required. No commercial use without permission.",
                    attributionRequirements: "Data source: Nigeria Geospatial Data Infrastructure (NGDI)",
                    accessRestrictions: [],
                    contactPerson: record.user?.name || "NGDI Contact",
                    email: record.user?.email || "contact@ngdi.gov.ng",
                    department: record.user?.department || "Geospatial Division",
                    userId: record.userId,
                    updateCycle: "Annually",
                };
                // Create the new Metadata record
                await prisma_1.prisma.metadata.create({
                    data: metadataRecord,
                });
                console.log(`Migrated record: ${record.dataName}`);
                migratedCount++;
            }
            catch (error) {
                console.error(`Error migrating record ${record.id}:`, error);
                errors.push({ id: record.id, error: String(error) });
            }
        }
        // Print migration summary
        console.log("\nMigration summary:");
        console.log(`- Total NGDI records: ${ngdiRecords.length}`);
        console.log(`- Successfully migrated: ${migratedCount}`);
        console.log(`- Skipped (already exists): ${skippedCount}`);
        console.log(`- Failed: ${errors.length}`);
        if (errors.length > 0) {
            console.log("\nErrors encountered:");
            errors.forEach((err, index) => {
                console.log(`${index + 1}. Record ID: ${err.id}`);
                console.log(`   Error: ${err.error}`);
            });
        }
        console.log("\nMetadata consolidation completed.");
    }
    catch (error) {
        console.error("Failed to execute migration:", error);
        process.exit(1);
    }
    finally {
        await prisma_1.prisma.$disconnect();
    }
}
main()
    .then(() => console.log("Migration script completed."))
    .catch((e) => {
    console.error("Error during migration:", e);
    process.exit(1);
});
