# Metadata Feature: NGDI Portal

## Overview
The metadata management feature is a core component of the NGDI Portal, allowing users to create, edit, view, search, and manage geospatial metadata following NGDI standards. This feature is essential for organizing and accessing Nigeria's geospatial data infrastructure.

## Key Components

### Database Model
The metadata model in `prisma/schema.prisma` is extensive and includes:
- Basic metadata information (title, author, organization)
- Geospatial data attributes (coordinates, projection, scale)
- Data quality information
- Access and distribution restrictions
- Temporal information
- Location details (country, state, LGA)
- Technical information (file format, size)
- Contact information
- Validation and assessment status

### UI Components
1. **Metadata Search**: `components/metadata/search-form.tsx` (20KB)
   - Advanced search form with multiple filters
   - Integration with search functionality

2. **Metadata List**: `components/metadata/metadata-list.tsx` (16KB)
   - Display of metadata entries in a list format
   - Sorting and filtering capabilities

3. **Metadata View**: `components/metadata/metadata-view.tsx` (6.7KB)
   - Detailed view of a single metadata entry
   - Display of all metadata attributes

4. **Search Results**: `components/metadata/results.tsx` (7.5KB)
   - Display of search results
   - Integration with the search form

5. **Metadata List Wrapper**: `components/metadata/metadata-list-wrapper.tsx`
   - Container component for the metadata list
   - Pagination and layout management

### API Endpoints
The metadata API routes are defined in `packages/api/src/routes/metadata.routes.ts` (11KB) and include:
- CRUD operations for metadata
- Search and filtering endpoints
- Validation endpoints
- Access control based on user roles

### Pages
Metadata pages are located in `app/metadata/` and include:
- Metadata listing page
- Metadata details page
- Metadata creation and editing pages
- Metadata search page

### User Workflows

1. **Metadata Creation**:
   - User navigates to metadata creation page
   - Multi-step form for inputting metadata information
   - Validation at each step
   - Submission and saving to database

2. **Metadata Search**:
   - User enters search criteria
   - System queries database based on criteria
   - Results displayed with sorting and filtering options
   - User can select and view detailed metadata

3. **Metadata Editing**:
   - User selects metadata to edit
   - Form pre-populated with existing data
   - User makes changes and submits
   - Validation and saving to database

4. **Metadata Viewing**:
   - User selects metadata to view
   - Detailed information displayed
   - Optional map visualization of geospatial data
   - Download or access options based on permissions

## Integration Points

1. **Map Visualization**: Metadata integrates with map components to visualize geospatial data.

2. **Search Functionality**: Metadata search uses the search components for advanced filtering.

3. **User Management**: Metadata access and editing permissions are controlled by user roles.

4. **API Integration**: Metadata API endpoints provide data for frontend components.

## Technical Implementation

1. **Data Model**: The metadata model is complex with numerous fields to support comprehensive geospatial metadata.

2. **Form Handling**: Metadata forms use React Hook Form with Zod schemas for validation.

3. **State Management**: Metadata state is managed with React Query for caching and efficient updates.

4. **API Integration**: Metadata components use React Query to fetch and mutate data via the API.

5. **Validation**: Comprehensive validation at both frontend and backend ensures data integrity.

## Optimization Considerations

1. **Performance**: With potentially large datasets, pagination and efficient queries are essential.

2. **Caching**: React Query provides caching for improved performance and reduced API calls.

3. **Form Complexity**: The multi-step form approach helps manage the complexity of metadata creation.

4. **Search Efficiency**: Optimized search algorithms handle complex filtering requirements.

## Future Enhancements

1. **Batch Operations**: Adding support for batch editing and deletion of metadata.

2. **Advanced Visualization**: Enhancing map visualization with additional layers and controls.

3. **Metadata Templates**: Adding support for metadata templates to facilitate creation.

4. **Versioning**: Implementing metadata versioning for tracking changes over time.

5. **Export/Import**: Adding support for various export and import formats.

## Known Issues

1. **Form Complexity**: The extensive metadata form may be overwhelming for users.

2. **Performance with Large Datasets**: Search and listing may need optimization for very large datasets.

3. **Validation Feedback**: Some validation error messages may need improvement for clarity.

## Documentation Status

The metadata feature has:
- Code documentation in the form of comments
- Component structure documentation
- API endpoint documentation

Additional documentation needed:
- User guide for metadata creation and management
- API documentation for external integrations
- Technical guide for maintaining and extending the feature 