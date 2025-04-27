# NGDI Portal Review: Duplication and Inconsistency Register

## Overview
This document tracks instances of code duplication and inconsistent patterns identified during the comprehensive review of the NGDI Portal codebase. Each entry includes recommendations for consolidation or standardization.

## Duplication Categories
- **COMPONENT**: Duplicate UI components or component logic
- **UTILITY**: Duplicate utility functions or helpers
- **API**: Duplicate API endpoints or handlers
- **LOGIC**: Duplicate business logic
- **STYLE**: Duplicate styling or design patterns
- **CONFIG**: Duplicate configuration

## Inconsistency Categories
- **NAMING**: Inconsistent naming conventions
- **STRUCTURE**: Inconsistent file or folder structure
- **PATTERN**: Inconsistent coding patterns or practices
- **STYLE**: Inconsistent styling approaches
- **API**: Inconsistent API design or response formats
- **ERROR**: Inconsistent error handling

## Impact Levels
- **HIGH**: Significantly affects maintainability, performance, or user experience
- **MEDIUM**: Moderately affects code quality or developer experience
- **LOW**: Minor inconsistency with limited impact

## Duplication Template

### [DUP-ID]: Brief descriptive title

**Category**: [CATEGORY]  
**Impact**: [IMPACT]  
**Locations**:
- Location 1 (file path and line numbers)
- Location 2 (file path and line numbers)
- ...

**Description**:  
Detailed description of the duplication, including context and impact.

**Consolidation Recommendation**:  
Specific recommendations for how to consolidate the duplicated code.

**Implementation Approach**:  
Suggested steps for implementing the consolidation.

**Potential Challenges**:  
Any challenges or considerations for the consolidation.

**Related Items**:  
Links to related duplication or inconsistency entries.

---

## Inconsistency Template

### [INC-ID]: Brief descriptive title

**Category**: [CATEGORY]  
**Impact**: [IMPACT]  
**Locations**:
- Location 1 (file path and line numbers)
- Location 2 (file path and line numbers)
- ...

**Description**:  
Detailed description of the inconsistency, including context and impact.

**Standardization Recommendation**:  
Specific recommendations for how to standardize the inconsistent patterns.

**Implementation Approach**:  
Suggested steps for implementing the standardization.

**Potential Challenges**:  
Any challenges or considerations for the standardization.

**Related Items**:  
Links to related duplication or inconsistency entries.

---

## Duplication Entries

### DUP-001: Example Duplication Title

**Category**: UTILITY  
**Impact**: MEDIUM  
**Locations**:
- packages/web/src/lib/utils.ts:45-60
- packages/api/src/utils/helpers.ts:23-38

**Description**:  
The date formatting utility functions are duplicated across the web and API packages with slight variations. Both implementations provide similar functionality but use different approaches.

**Consolidation Recommendation**:  
Move the date formatting utilities to the shared `@ngdi/utils` package and use this shared implementation in both the web and API packages.

**Implementation Approach**:  
1. Create a comprehensive date utility in `packages/utils/src/date.ts`
2. Update imports in the web and API packages
3. Remove the duplicate implementations

**Potential Challenges**:  
Slight differences in the implementations may require careful testing to ensure all use cases are covered by the consolidated version.

**Related Items**:  
DUP-003, INC-002

---

## Inconsistency Entries

### INC-001: Example Inconsistency Title

**Category**: NAMING  
**Impact**: LOW  
**Locations**:
- packages/web/src/components/
- packages/ui/src/components/

**Description**:  
Component naming conventions are inconsistent across the codebase. Some components use PascalCase filenames (Button.tsx) while others use kebab-case (date-picker.tsx).

**Standardization Recommendation**:  
Standardize on PascalCase for all component filenames to align with React component naming conventions.

**Implementation Approach**:  
1. Document the naming convention standard
2. Rename files to follow the standard
3. Update imports throughout the codebase

**Potential Challenges**:  
File renaming may cause issues with case-sensitive systems and require careful updates to all import statements.

**Related Items**:  
INC-003

---

### INC-002: Example API Inconsistency

**Category**: API  
**Impact**: MEDIUM  
**Locations**:
- packages/api/src/routes/auth.routes.ts
- packages/api/src/routes/user.routes.ts
- packages/api/src/routes/metadata.routes.ts

**Description**:  
API response formats are inconsistent across different routes. Some routes return data directly, others wrap it in a `data` property, and error handling varies between routes.

**Standardization Recommendation**:  
Implement a consistent API response format across all routes:
```typescript
{
  success: boolean,
  data?: any,
  error?: {
    code: string,
    message: string
  }
}
```

**Implementation Approach**:  
1. Create a response utility function
2. Update all route handlers to use this utility
3. Update frontend code to expect consistent response format

**Potential Challenges**:  
Significant changes to API response format will require coordinated updates to frontend code that consumes these APIs.

**Related Items**:  
INC-004

---

<!-- Add more entries following the templates above -->
