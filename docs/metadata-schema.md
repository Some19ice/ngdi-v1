# NGDI Metadata Schema Documentation

This document outlines the metadata schema used in the National Geospatial Data Infrastructure (NGDI) system. The schema defines the structure and requirements for metadata entries that describe geospatial datasets.

## Overview

The NGDI metadata schema is implemented through three interconnected forms:
1. **Form 1: General Information And Description Form** - Basic dataset information, fundamental datasets, description, spatial domain, location, status, constraints, and metadata reference
2. **Form 2: Data Quality Information Form** - Quality metrics, attribute accuracy, positional accuracy, source information, and processing details
3. **Form 3: Data Distribution Information Form** - Distribution details, distributor information, and access information

## Form 1: General Information And Description Form

### Data Information

| Field Name | Type | Description | Definition | Required |
|------------|------|-------------|-----------|----------|
| Data Type | Select (Raster/Vector/Table) | The method used to represent geographic features in the dataset | The fundamental approach used to represent spatial information: either as a grid of cells (raster), as points, lines, and polygons (vector), or as tabular data (table). This determines how the data is structured and what types of analysis can be performed. | Yes |
| Data Name/Title | Text | The official name of the geospatial dataset | A unique and descriptive title that clearly identifies the dataset. Should be concise yet informative enough to distinguish it from similar datasets. | Yes |
| % Cloud Cover of Image | Text | Percentage of cloud cover in imagery | For remote sensing datasets, the percentage of the area obscured by clouds, which affects data usability for certain applications. | No |
| Date of Production | Date | The date when this version of the dataset was created or published | The specific date when this version or edition of the dataset was officially released or made available. Helps track different versions of the same dataset over time. | Yes |

### Fundamental Datasets

| Field Name | Type | Description | Definition | Required |
|------------|------|-------------|-----------|----------|
| Geodetic Data | Checkbox | Indicates if the dataset contains geodetic data | Datasets that provide the foundation for positioning, including coordinate systems, geodetic control networks, and reference frames. | No |
| Topographic Data/DEM | Checkbox | Indicates if the dataset contains topographic data or digital elevation models | Datasets that represent the physical surface of the Earth, including elevation, terrain, and relief information. | No |
| Cadastral Data | Checkbox | Indicates if the dataset contains cadastral data | Datasets related to land ownership, property boundaries, and land parcel information. | No |
| Administrative Boundaries | Checkbox | Indicates if the dataset contains administrative boundaries | Datasets that define political and administrative divisions at various levels (national, state, local). | No |
| Hydrographic Data | Checkbox | Indicates if the dataset contains hydrographic data | Datasets related to water bodies, including rivers, lakes, oceans, and drainage networks. | No |
| Land use/Land Cover | Checkbox | Indicates if the dataset contains land use or land cover data | Datasets that classify and map how land is used or what physical material covers the Earth's surface. | No |
| Geological Data | Checkbox | Indicates if the dataset contains geological data | Datasets related to the Earth's physical structure, rock formations, and geological features. | No |
| Demographic Data | Checkbox | Indicates if the dataset contains demographic data | Datasets related to human populations, including distribution, density, and socioeconomic characteristics. | No |
| Digital Imagery and Image Maps | Checkbox | Indicates if the dataset contains digital imagery or image maps | Datasets consisting of aerial or satellite imagery, orthophotos, or image-based maps. | No |
| Transportation Data | Checkbox | Indicates if the dataset contains transportation data | Datasets related to transportation networks, including roads, railways, airports, and waterways. | No |
| Others | Checkbox | Indicates if the dataset contains other types of fundamental data | Used when the dataset contains fundamental data types not covered by the standard categories. | No |
| Other fundamental dataset | Text | Description of other fundamental dataset types | Allows specification of additional fundamental dataset types not covered by the standard categories. | No |

### Description

| Field Name | Type | Description | Definition | Required |
|------------|------|-------------|-----------|----------|
| Abstract | Text | A summary of the dataset's content and purpose | A concise narrative that summarizes what the dataset contains, how it was created, and its intended use. The abstract should provide enough information for users to determine if the dataset is relevant to their needs. | Yes |
| Purpose | Text | The reason the dataset was created | A statement explaining why the dataset was created and what applications or uses it was intended to support. This helps users understand if the dataset is appropriate for their specific use case. | Yes |
| Thumbnail | File/URL | A visual preview of the dataset | A small image that provides a visual representation of the dataset. For spatial data, this is typically a reduced-resolution map showing the geographic coverage and key features. | Yes |

### Spatial Domain

| Field Name | Type | Description | Definition | Required |
|------------|------|-------------|-----------|----------|
| Coordinate Unit | Select (DD/DMS) | The unit system used for coordinates | The measurement system used to express geographic coordinates: either Decimal Degrees (DD) or Degrees, Minutes, Seconds (DMS). This is essential for correctly interpreting the coordinate values. | Yes |
| Min. Latitude X | Numeric | The southern boundary coordinate | The southernmost latitude value that defines the extent of the dataset's coverage area. | Yes |
| Min Longitude Y | Numeric | The western boundary coordinate | The westernmost longitude value that defines the extent of the dataset's coverage area. | Yes |
| Max. Latitude X | Numeric | The northern boundary coordinate | The northernmost latitude value that defines the extent of the dataset's coverage area. | Yes |
| Max. Longitude Y | Numeric | The eastern boundary coordinate | The easternmost longitude value that defines the extent of the dataset's coverage area. | Yes |

### Location

| Field Name | Type | Description | Definition | Required |
|------------|------|-------------|-----------|----------|
| Country | Select | The country covered by the dataset | The nation whose territory is represented in the dataset. For NGDI, this is typically Nigeria, but may include neighboring countries for cross-border datasets. | Yes |
| Geopolitical Zone | Select | The geopolitical zone within Nigeria | The geopolitical grouping of states in Nigeria. Options include North West, North East, North Central, South South, South West, and South East. | Yes |
| State | Text | The state or province | The primary administrative division within the country where the data was collected or which it represents. | Yes |
| LGA | Text | Local Government Area | The local administrative division within a state. In Nigeria, this refers to the Local Government Area, which is the third tier of government. | Yes |
| Town/City | Text | The specific locality | The urban or rural settlement area represented in the dataset, providing the most granular level of geographic context. | Yes |

### Status of Data

| Field Name | Type | Description | Definition | Required |
|------------|------|-------------|-----------|----------|
| Assessment | Select | The completion status of the dataset | Indicates whether the dataset is complete or still in development. Options include "Complete" or "Incomplete", helping users understand the dataset's maturity. | Yes |
| Update Frequency | Select | How often the dataset is updated | The established schedule for reviewing and refreshing the dataset. Options include Monthly, Quarterly, Bi-Annually, and Annually, helping users know how current the data is likely to be. | Yes |

### Resource Constraint

| Field Name | Type | Description | Definition | Required |
|------------|------|-------------|-----------|----------|
| Access Constraints | Text | Restrictions on who can access the dataset and under what conditions | Specific limitations on who is permitted to access the dataset, which may include security classifications, privacy concerns, or institutional policies that restrict availability to certain users or groups. | Yes |
| Use Constraints | Text | Restrictions on how the dataset can be used, including legal and licensing limitations | Legal or policy restrictions that govern how the dataset may be used once accessed, including copyright information, attribution requirements, and limitations on redistribution or derivative works. | Yes |
| Other Constraints | Text | Any additional restrictions or considerations not covered by access or use constraints | Supplementary constraints that don't fit into standard categories, such as ethical considerations, cultural sensitivities, or temporary limitations that users should be aware of. | Yes |

### Metadata Reference

| Field Name | Type | Description | Definition | Required |
|------------|------|-------------|-----------|----------|
| Metadata Creation Date | Date | The date the metadata was created | The date when the metadata record itself was created or last substantially revised. This helps track the currency of the metadata information. | Yes |
| Metadata review date | Date | The date the metadata was last reviewed | The date when the metadata was last checked for accuracy and completeness. Regular reviews ensure metadata quality and relevance. | Yes |
| Contact Name | Text | Name of the metadata contact person | The individual responsible for maintaining the metadata record and who can answer questions about the metadata content. | Yes |
| Address | Text | Address of the metadata contact | The physical or postal address where the metadata contact person can be reached. | Yes |
| E-mail | Email | Email of the metadata contact | The electronic mail address for contacting the person responsible for the metadata. | Yes |
| Phone Number | Phone | Phone number of the metadata contact | The telephone number where the metadata contact person can be reached. | Yes |

## Form 2: Data Quality Information Form

### General Section

| Field Name | Type | Description | Definition | Required |
|------------|------|-------------|-----------|----------|
| Logical Consistency Report | Text | Information about the logical integrity of the dataset | A description of the fidelity of relationships in the data and tests applied to ensure logical consistency. This may include topological consistency for vector data or band consistency for raster data. | No |
| Completeness Report | Text | Information about omissions, selection criteria, or other factors affecting completeness | A description of how complete the dataset is relative to its intended scope, including any known data gaps or limitations in coverage. | No |

### Attribute Accuracy

| Field Name | Type | Description | Definition | Required |
|------------|------|-------------|-----------|----------|
| Accuracy Report | Text | Description of the accuracy of the attributes | A narrative assessment of how accurately the attributes in the dataset represent the real-world features they describe. | No |

### Positional Accuracy

#### Horizontal Accuracy

| Field Name | Type | Description | Definition | Required |
|------------|------|-------------|-----------|----------|
| Accuracy Report | Text | Description of the horizontal positional accuracy | A narrative assessment of how accurately the horizontal positions in the dataset represent the actual locations of features on the Earth's surface. | No |
| % Value | Numeric | Quantitative measure of horizontal accuracy | A numerical value representing the degree of horizontal positional accuracy, often expressed as a percentage or in ground distance units. | No |
| Explanation | Text | Details about how horizontal accuracy was determined | A description of the methods used to evaluate horizontal positional accuracy, including any reference datasets used for comparison. | No |

#### Vertical Accuracy

| Field Name | Type | Description | Definition | Required |
|------------|------|-------------|-----------|----------|
| Accuracy Report | Text | Description of the vertical positional accuracy | A narrative assessment of how accurately the elevation or depth values in the dataset represent the actual vertical positions of features. | No |
| % Value | Numeric | Quantitative measure of vertical accuracy | A numerical value representing the degree of vertical positional accuracy, often expressed as a percentage or in linear units of elevation. | No |
| Explanation | Text | Details about how vertical accuracy was determined | A description of the methods used to evaluate vertical positional accuracy, including any reference datasets used for comparison. | No |

### Source Information

| Field Name | Type | Description | Definition | Required |
|------------|------|-------------|-----------|----------|
| Source Scale Denominator | Numeric | The scale of the source material | For data derived from maps, the representative fraction denominator of the source map scale (e.g., 24000 for a 1:24,000 scale map). | No |
| Type Of Source Media | Text | The medium of the source material | The physical or digital medium of the source material from which the dataset was derived (e.g., aerial photograph, satellite image, paper map). | No |
| Source Citation | Text | Citation for the source | A formal citation for the source material from which the dataset was derived. | No |
| Citation Title | Text | The title of the source material | The formal title of the source material from which the dataset was derived. | No |
| Contract/Grant Reference | Text | Reference to any contract or grant | Identifier for any contract, grant, or project under which the source data was collected or created. | No |
| Date of Contract/Grant | Date | Date of the contract or grant | The date when the contract was signed or the grant was awarded for the creation or collection of the source data. | No |

### Data Processing Information

| Field Name | Type | Description | Definition | Required |
|------------|------|-------------|-----------|----------|
| Data Processing Description | Text | Description of the processing steps | A narrative description of the procedures, algorithms, or transformations applied to create the dataset from its sources. | Yes |
| Software Version Used | Text | Software used in processing | The name and version of any software packages used to process the data. | No |
| Date Processed | Date | Date when processing occurred | The date when the processing steps were executed. | Yes |

### Processor Contact Information

| Field Name | Type | Description | Definition | Required |
|------------|------|-------------|-----------|----------|
| Name | Text | Name of person responsible for processing | The individual who performed or supervised the data processing steps. | Yes |
| E-mail | Email | Email of process contact | The electronic mail address of the person responsible for processing. | Yes |
| Address | Text | Address of process contact | The physical or postal address of the person responsible for processing. | Yes |

## Form 3: Data Distribution Information Form

### Distributor Information

| Field Name | Type | Description | Definition | Required |
|------------|------|-------------|-----------|----------|
| Distributor/Custodian Name | Text | Name of the distributing organization | The name of the entity responsible for distributing the dataset to users. | Yes |
| Address | Text | Address of the distributor | The physical or postal address of the distributing organization. | Yes |
| E-mail | Email | Email contact for the distributor | The electronic mail address for contacting the distributor about obtaining the dataset. | Yes |
| Phone Number | Phone | Phone number for the distributor | The telephone number for contacting the distributor about obtaining the dataset. | Yes |
| Web Link | URL | Website of the distributor | The URL of the distributor's website where additional information about the dataset or the distributor can be found. | No |
| Social Media Handle | Text | Social media contact for the distributor | The social media username or handle where the distributor can be contacted or where updates about the dataset may be posted. | No |

### Distribution Details

| Field Name | Type | Description | Definition | Required |
|------------|------|-------------|-----------|----------|
| Distribution Liability | Text | Legal statement about liability | A statement of the liability assumed by the distributor and any limitations on the dataset's use related to liability concerns. | Yes |
| Custom Order Process | Text | Process for custom orders | Instructions for how users can request customized versions or subsets of the dataset. | Yes |
| Technical Prerequisites | Text | Technical requirements for using the data | Description of any hardware, software, or technical knowledge required to properly use the dataset. | Yes |

### Standard Order Process

| Field Name | Type | Description | Definition | Required |
|------------|------|-------------|-----------|----------|
| Fees | Numeric/Text | Cost to obtain the dataset | The monetary cost or other fees associated with obtaining the dataset. | Yes |
| Turnaround Time | Text | Time required to fulfill orders | The typical time period between ordering the dataset and receiving it. | Yes |
| Ordering Instructions | Text | How to order the dataset | Detailed instructions on the procedures for ordering or requesting the dataset. | Yes |

## Additional Reference Information

The following information is not directly captured in the forms but is important for the complete metadata record:

| Field Name | Type | Description | Definition | Required |
|------------|------|-------------|-----------|----------|
| Hierarchy Level | Text | The level of the dataset in a hierarchical classification system | The position of the dataset within a structured classification framework, indicating whether it represents a series, dataset, feature, attribute, or other level of information granularity. | Yes |
| Reference System | Text | The specific coordinate reference system used (e.g., WGS84, UTM) | The formal name or identifier of the coordinate reference system that defines how coordinates in the dataset relate to locations on the Earth's surface. Essential for accurate spatial analysis and integration with other datasets. | Yes |
| Identifier | Text | A unique identifier for the dataset | A persistent and unique alphanumeric code that distinguishes this dataset from all others in the NGDI system. Serves as a permanent reference for citing or accessing the specific dataset. | Yes |
| Language | Select | The primary language used in the dataset | The human language used for textual attributes and documentation within the dataset. Important for internationalization and ensuring users can understand the content. | Yes |
| Character Encoding | Text | The character encoding standard used in the dataset (e.g., UTF-8, ASCII) | The specific encoding system used to represent text characters in the dataset's digital files. Ensures that text attributes can be correctly interpreted and displayed by software applications. | Yes |

## Schema Implementation

This schema follows international standards for geospatial metadata, including elements from ISO 19115 and the Federal Geographic Data Committee (FGDC) Content Standard for Digital Geospatial Metadata. It has been adapted to meet the specific needs of the Nigerian National Geospatial Data Infrastructure.

## Relationship to NGDI Core Components

This metadata schema supports several core components of the NGDI:

1. **Data Standards and Interoperability** - By providing a standardized way to describe geospatial datasets
2. **Metadata and Clearinghouse Services** - Enabling data discoverability and easy access
3. **Fundamental Datasets** - Supporting the documentation of core geospatial datasets
4. **Open Access and Data Security** - Documenting access and use constraints

## Usage Guidelines

When completing metadata entries:
- Be as specific and accurate as possible
- Use standardized terminology where applicable
- Include all required fields
- Provide detailed descriptions to improve discoverability
- Update metadata when the dataset changes
- Follow the three-form workflow (General Information → Quality Information → Distribution Information)
- Save progress regularly to avoid data loss 

## Form Field Alignment

This schema documentation has been aligned with the actual form fields implemented in the NGDI metadata system. The fields are organized into three forms:

1. **Form 1: General Information And Description Form**
   - Data Information
   - Fundamental Datasets
   - Description
   - Spatial Domain
   - Location
   - Status of Data
   - Resource Constraint
   - Metadata Reference

2. **Form 2: Data Quality Information Form**
   - General Section
   - Attribute Accuracy
   - Positional Accuracy
   - Source Information
   - Data Processing Information
   - Processor Contact Information

3. **Form 3: Data Distribution Information Form**
   - Distributor Information
   - Distribution Details
   - Standard Order Process

The field names, types, and options in this documentation match those in the actual implementation to ensure consistency between documentation and the system. 