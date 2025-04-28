# Form Validation

This directory contains utilities and schemas for form validation in the NGDI Portal application.

## Overview

The form validation system in this application is built on:

- [Zod](https://github.com/colinhacks/zod) for schema validation
- [React Hook Form](https://react-hook-form.com/) for form state management
- Custom hooks and components for a consistent validation experience

## Key Components

### 1. Validation Schemas

Centralized validation schemas are defined in `schemas.ts`. These ensure consistent validation rules across all forms in the application.

```tsx
import { emailSchema, passwordSchema } from "@/lib/validation/schemas"

// Use in your own schema
const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})
```

### 2. Form Validation Hook

The `useFormValidation` hook provides a consistent way to handle form validation and submission:

```tsx
const {
  register,
  handleSubmit,
  formState,
  isSubmitting,
  submitError,
  setFieldErrors,
} = useFormValidation({
  schema: loginSchema,
  defaultValues: {
    email: "",
    password: "",
  },
  onSubmit: async (values) => {
    await loginUser(values)
  },
  successMessage: "Login successful!",
})
```

### 3. Form Validation Provider

The `FormValidationProvider` component wraps your form with the validation context:

```tsx
<FormValidationProvider
  schema={loginSchema}
  defaultValues={{
    email: "",
    password: "",
  }}
  onSubmit={handleSubmit}
>
  {/* Form fields go here */}
</FormValidationProvider>
```

### 4. Enhanced Form Inputs

Enhanced form input components with built-in validation:

```tsx
<TextInput
  name="email"
  label="Email Address"
  placeholder="Enter your email"
  required
  tooltip="We'll never share your email"
/>

<FormPasswordInput
  name="password"
  label="Password"
  required
  showStrengthMeter
/>

<SelectInput
  name="role"
  label="Role"
  options={roleOptions}
  required
/>

<TextareaInput
  name="bio"
  label="Bio"
  showCharacterCount
  maxLength={500}
/>

<CheckboxInput
  name="acceptTerms"
  label="I accept the terms and conditions"
  required
/>

<DateInput
  name="birthDate"
  label="Birth Date"
  fromYear={1900}
  toYear={2023}
/>
```

## Complete Example

```tsx
import { z } from "zod"
import { FormValidationProvider } from "@/components/ui/form-validation-provider"
import { TextInput, FormPasswordInput } from "@/components/ui/form-inputs"
import { Button } from "@/components/ui/button"

// Define validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const handleSubmit = async (values: LoginFormValues) => {
    // Submit form data
    await loginUser(values)
  }

  return (
    <FormValidationProvider
      schema={loginSchema}
      defaultValues={{
        email: "",
        password: "",
      }}
      onSubmit={handleSubmit}
    >
      <TextInput
        name="email"
        label="Email Address"
        placeholder="Enter your email"
        required
      />
      
      <FormPasswordInput
        name="password"
        label="Password"
        required
      />
      
      <Button type="submit">
        Log In
      </Button>
    </FormValidationProvider>
  )
}
```

## API Validation Integration

The form validation system integrates with API validation errors:

```tsx
try {
  await api.post("/api/users", values)
} catch (error) {
  if (error.response?.data?.errors) {
    // Set field errors from API response
    setFieldErrors(error.response.data.errors)
  } else {
    throw new Error("Failed to create user")
  }
}
```

## Best Practices

1. **Use centralized schemas**: Import and reuse schemas from `schemas.ts` whenever possible
2. **Provide helpful error messages**: Make error messages clear and actionable
3. **Use tooltips for guidance**: Add tooltips to explain form fields
4. **Show validation in real-time**: Validation errors appear as users type
5. **Handle API validation errors**: Map API validation errors to form fields
6. **Provide success feedback**: Show toast notifications on successful submission
