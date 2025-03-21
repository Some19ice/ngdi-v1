# Metadata Multi-Step Form Implementation

This document outlines the implementation of the metadata multi-step form used for adding or editing metadata records in the NGDI Data Portal.

## Overview

The form follows a multi-step process to collect comprehensive metadata about geospatial datasets. It's designed to guide users through a structured data entry workflow, breaking down the complex metadata entry process into manageable sections.

## Form Structure

The form is divided into four main steps:

1. **General Information** - Basic dataset information and identification
2. **Technical Details** - Spatial and technical specifications 
3. **Access Information** - Distribution and usage rights
4. **Review & Submit** - Final review before submission

## Main Components

### `MetadataForm` Component

This is the main container component that manages:

- Step navigation
- Form state across steps
- Form submission

```tsx
const MetadataForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Initial form data structure with all fields
    // ...
  });
  
  const updateFormData = (stepData: any) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  };
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handleSubmit = async () => {
    // Submit form data to backend
    // Show success/failure toast messages
  };
  
  // Render appropriate step form based on currentStep
  const renderStep = () => {
    switch (currentStep) {
      case 0: return <GeneralInfoForm formData={formData} updateFormData={updateFormData} />;
      case 1: return <TechnicalDetailsForm formData={formData} updateFormData={updateFormData} />;
      case 2: return <AccessInformationForm formData={formData} updateFormData={updateFormData} />;
      case 3: return <MetadataReview formData={formData} />;
      default: return <GeneralInfoForm formData={formData} updateFormData={updateFormData} />;
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="relative">
        {/* Progress bar */}
        <div className="overflow-hidden rounded-full bg-gray-200">
          <div 
            className="h-2 rounded-full bg-ngdi-600 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        
        {/* Step indicators */}
        <div className="mt-6 grid grid-cols-4 text-sm gap-2">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`text-center ${index <= currentStep ? 'text-ngdi-600 font-medium' : 'text-gray-500'}`}
            >
              {/* Step number circles */}
              {/* Step labels */}
            </div>
          ))}
        </div>
      </div>
      
      {/* Form card */}
      <Card className="p-6 shadow-md">
        {renderStep()}
        
        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          {/* Previous button */}
          {/* Next/Submit button */}
        </div>
      </Card>
    </div>
  );
};
```

## Step-Specific Form Components

Each step is implemented as its own form component with validation specific to the fields in that step.

### 1. General Information Form

```tsx
const GeneralInfoForm: React.FC<FormProps> = ({ formData, updateFormData }) => {
  // Form implementation with react-hook-form and zod validation
}
```

#### Fields Collected:

- **Citation Details**
  - Author name
  - Dataset title
  - Organization
  - Date range (from/to)
  
- **Abstract and Purpose**
  - Abstract description
  - Purpose statement
  
- **Thumbnail Management**
  - Thumbnail URL or upload
  - Image name
  
- **Categories**
  - Framework data type (dropdown)
  - Categories (multi-select checkboxes)

### 2. Technical Details Form

```tsx
const TechnicalDetailsForm: React.FC<FormProps> = ({ formData, updateFormData }) => {
  // Form implementation with react-hook-form and zod validation
}
```

#### Fields Collected:

- **Spatial Information**
  - Coordinate system
  - Projection
  - Scale
  - Resolution
  
- **Data Quality Parameters**
  - Accuracy level
  - Completeness percentage
  - Consistency check flag
  - Validation status
  
- **Technical Specifications**
  - File format
  - File size
  - Number of features
  - Software requirements
  
- **Update Frequency**
  - Update cycle
  - Last update date
  - Next update date

### 3. Access Information Form

```tsx
const AccessInformationForm: React.FC<FormProps> = ({ formData, updateFormData }) => {
  // Form implementation with react-hook-form and zod validation
}
```

#### Fields Collected:

- **Distribution Details**
  - Distribution format
  - Access method
  - Download URL
  - API endpoint
  
- **Usage Restrictions**
  - License type
  - Usage terms
  - Attribution requirements
  - Access restrictions
  
- **Contact Information**
  - Contact person
  - Email address
  - Phone number
  - Organization
  - Department
  
- **Access Methods**
  - Direct download
  - API access
  - Web services
  - Physical media

### 4. Metadata Review

```tsx
const MetadataReview: React.FC<MetadataReviewProps> = ({ formData }) => {
  // Read-only display of all collected metadata
}
```

This component provides a comprehensive view of all collected metadata before submission, displaying it in well-organized sections that match the previous form steps.

## Form Validation

- **Schema-based validation** using Zod to define validation rules for each form section
- **Form state management** using react-hook-form for handling form values, validation, and errors
- **Required fields** clearly marked with asterisks
- **Validation messages** displayed below form fields for immediate feedback

## Form State Management

- **React context** is not used; instead form state is managed in the parent `MetadataForm` component
- **State is passed down** to child components via props
- **Updates flow back up** through an `updateFormData` callback function
- **Form watching** is implemented to automatically sync child form state with parent component

## User Experience Features

1. **Progress Indicator**
   - Visual progress bar showing completion
   - Step indicators with completed steps marked with checkmarks
   
2. **Navigation**
   - Previous/Next buttons for moving between steps
   - Submit button on final step
   - Auto-scroll to top when changing steps
   
3. **Responsive Design**
   - Grid layouts that adapt to screen size
   - Full mobile compatibility
   
4. **Visual Cues**
   - Color-coded current step
   - Required fields marked with asterisks
   - Validation errors clearly displayed

## Form Submission

The final submission process:

1. Validates all form data
2. Sends data to the backend (implementation details depend on the backend)
3. Displays toast notifications for success/failure
4. Either resets the form or redirects to another page upon success

## Technical Implementation Details

- **UI Components**: Uses a customized UI component library
- **Validation**: Zod schema validation with react-hook-form
- **Layout**: Tailwind CSS for responsive styling
- **Icons**: Lucide React icons
- **Notifications**: Toast system for feedback

This form design follows best practices for complex form implementation, breaking down a potentially overwhelming task into manageable chunks while maintaining data consistency across all steps. 