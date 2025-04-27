# Metadata Model Optimization

This document explains the optimization of the Metadata model in the NGDI Portal.

## Overview

The Metadata model is one of the most complex models in the NGDI Portal, with over 100 fields. To optimize this model, we've made the following changes:

1. **Consolidated Fields**: Grouped related fields into JSON objects to reduce the number of columns.
2. **Added Indexes**: Added indexes for common query patterns to improve performance.
3. **Simplified Structure**: Separated core fields from optional fields to improve clarity.
4. **Improved Documentation**: Added comprehensive documentation for the model.

## Model Structure

The optimized Metadata model has the following structure:

### Core Fields

These fields are always required and are stored as individual columns:

- `id`: Unique identifier for the metadata entry
- `title`: Title of the dataset
- `dataName`: Name of the dataset (more descriptive title)
- `dataType`: Type of data (Raster, Vector, Table)
- `abstract`: Abstract/description of the dataset
- `purpose`: Purpose of the dataset
- `productionDate`: Date when the dataset was produced
- `organization`: Organization name
- `author`: Author of the dataset
- `categories`: Categories of the dataset
- `frameworkType`: Framework type
- `thumbnailUrl`: URL to the thumbnail image
- `imageName`: Name of the image file
- `dateFrom`: Start date of the dataset
- `dateTo`: End date of the dataset
- `updateFrequency`: Frequency of updates
- `validationStatus`: Validation status
- `assessment`: Completion status

### Spatial Information

These fields are related to spatial information and are stored as individual columns:

- `coordinateUnit`: Unit system for coordinates (DD or DMS)
- `minLatitude`: Southernmost latitude value
- `minLongitude`: Westernmost longitude value
- `maxLatitude`: Northernmost latitude value
- `maxLongitude`: Easternmost longitude value
- `coordinateSystem`: Coordinate system used
- `projection`: Projection used
- `scale`: Scale of the dataset
- `resolution`: Resolution of the dataset

### File Information

These fields are related to file information and are stored as individual columns:

- `fileFormat`: File format
- `fileSize`: File size in bytes
- `numFeatures`: Number of features

### Distribution Information

These fields are related to distribution information and are stored as individual columns:

- `distributionFormat`: Distribution format
- `accessMethod`: Access method
- `downloadUrl`: Download URL
- `apiEndpoint`: API endpoint
- `licenseType`: License type
- `usageTerms`: Usage terms
- `attributionRequirements`: Attribution requirements
- `accessRestrictions`: Access restrictions

### JSON Fields

The following fields are stored as JSON objects to reduce the number of columns:

- `locationInfo`: Location information including country, state, LGA, etc.
- `qualityInfo`: Quality information including accuracy, completeness, etc.
- `contactInfo`: Contact information including contact person, email, etc.
- `metadataReferenceInfo`: Metadata reference information including creation date, review date, etc.
- `dataQualityInfo`: Data quality information including consistency, completeness, etc.
- `dataProcessingInfo`: Data processing information including processing steps, software version, etc.
- `distributionDetails`: Distribution details including distributor, fees, etc.
- `legacyFields`: Legacy fields from the original Metadata model
- `fundamentalDatasets`: Information about fundamental dataset types

### Relationships

- `userId`: Reference to the user who created this entry
- `user`: Relation to the User model

### Timestamps

- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Indexes

The following indexes have been added to improve query performance:

- `userId`: For finding metadata by user
- `title`: For searching by title
- `dataName`: For searching by data name
- `dataType`: For filtering by data type
- `organization`: For filtering by organization
- `frameworkType`: For filtering by framework type
- `fileFormat`: For filtering by file format
- `validationStatus`: For filtering by validation status
- `assessment`: For filtering by assessment status
- `dateFrom, dateTo`: For date range queries
- `productionDate`: For filtering by production date
- `updateFrequency`: For filtering by update frequency
- `categories`: For filtering by categories

## Migration

The migration process involves the following steps:

1. Create temporary table to store existing data
2. Add new JSON columns
3. Update JSON columns with data from existing columns
4. Drop columns that are now stored in JSON fields
5. Add indexes for common query patterns

## Benefits

The optimized Metadata model provides the following benefits:

1. **Reduced Column Count**: The number of columns has been reduced from over 100 to about 40.
2. **Improved Query Performance**: Indexes have been added for common query patterns.
3. **Flexible Schema**: JSON fields allow for flexible schema evolution without requiring migrations.
4. **Simplified API**: The API can work with a simpler model while still providing all the necessary data.
5. **Reduced Database Size**: JSON fields can be compressed, reducing the overall database size.

## Usage

When working with the Metadata model, keep the following in mind:

1. **Core Fields**: Always use the core fields for filtering and sorting.
2. **JSON Fields**: Use JSON fields for additional data that doesn't need to be filtered or sorted.
3. **Indexes**: Use indexed fields for filtering and sorting to improve performance.
4. **Legacy Fields**: Use the `legacyFields` JSON field for backward compatibility.
