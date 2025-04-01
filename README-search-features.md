# NGDI Portal Search Feature Enhancements

This document outlines the search feature enhancements implemented in the NGDI Portal application.

## Overview

The search functionality has been enhanced with the following features:

1. **Visual search indication** - Clear indication of active search parameters and filter status
2. **Search suggestions** - Type-ahead suggestions for common search terms
3. **Shareable search URLs** - Ability to share search results via URL
4. **Saved searches** - Save and reuse search parameters for future use
5. **Map visualization** - Toggle between list and map view for search results
6. **Advanced filtering options** - Additional filtering capabilities for more precise searches

## Implementation Details

### Client-Side Hydration

The search features use a hybrid approach:
- Server-side rendering for initial page load and SEO
- Client-side hydration for interactive features
- Client-side state persisted in localStorage for saved searches

### Key Components

1. **Search Page (`app/search/page.tsx`)**
   - Main container for the search experience
   - Handles server-side rendering and data fetching
   - Includes hydration points for client-side features

2. **Search Form (`components/metadata/search-form.tsx`)**
   - Handles basic search input and filter controls
   - Supports search suggestions and form validation

3. **Results Component (`components/metadata/results.tsx`)**
   - Displays search results in list or map view
   - Handles sharing and result interaction

4. **Hydration Script (`public/scripts/search-hydration.js`)**
   - Client-side script that enhances the server-rendered page
   - Adds interactivity for view toggling, saved searches, and advanced filters

### Using Saved Searches

Saved searches are stored in browser localStorage:
- Users can save any search configuration with a custom name
- Saved searches persist between sessions
- Each saved search includes the full query parameters and timestamp

### Map Visualization

Map view:
- Toggled via a view control in the interface
- Defaults to list view for initial searches
- Maintains view preference across searches via URL parameter

### Advanced Filtering

Advanced filter capabilities:
- Quality rating filtering
- Validation status filtering
- Spatial filtering (bounding box)
- Resource type and topic filtering
- Organization filtering
- Date range filtering

## API Integration

For complete functionality, the search feature requires backend API support for:

1. **Spatial queries** - For map-based filtering and visualization
2. **Advanced filtering** - For server-side filter processing
3. **Search analytics** - For improving search suggestions

## Future Enhancements

Planned future enhancements include:
- User account-based saved searches (server-side persistence)
- Collaborative search sharing
- Search history tracking
- Enhanced geospatial filtering (drawing regions)
- Faceted search improvements 