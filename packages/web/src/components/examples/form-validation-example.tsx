"use client"

import React, { useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FormValidationProvider } from "@/components/ui/form-validation-provider"
import {
  TextInput,
  FormPasswordInput,
  SelectInput,
  TextareaInput,
  CheckboxInput,
  DateInput,
} from "@/components/ui/form-inputs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

// Define validation schema using Zod
const formSchema = z.object({
  // Personal Information
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  
  // Account Information
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  
  // Profile Information
  bio: z.string().max(500, "Bio must be at most 500 characters").optional().or(z.literal("")),
  role: z.string().min(1, "Please select a role"),
  birthDate: z.date().optional(),
  
  // Preferences
  receiveEmails: z.boolean().default(false),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type FormValues = z.infer<typeof formSchema>

/**
 * Form validation example component
 * Demonstrates how to use the form validation components
 */
export function FormValidationExample() {
  const [activeTab, setActiveTab] = useState("personal")
  
  const handleSubmit = async (values: FormValues) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    console.log("Form submitted:", values)
    toast.success("Form submitted successfully!")
    
    // In a real application, you would submit the form to an API
    // try {
    //   await api.post("/api/users", values)
    //   toast.success("User created successfully!")
    // } catch (error) {
    //   console.error("Error creating user:", error)
    //   throw new Error("Failed to create user. Please try again.")
    // }
  }
  
  const roleOptions = [
    { value: "user", label: "User" },
    { value: "admin", label: "Administrator" },
    { value: "editor", label: "Editor" },
    { value: "viewer", label: "Viewer" },
  ]
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Form Validation Example</CardTitle>
        <CardDescription>
          This form demonstrates the enhanced form validation components
        </CardDescription>
      </CardHeader>
      
      <FormValidationProvider
        schema={formSchema}
        defaultValues={{
          name: "",
          email: "",
          phone: "",
          username: "",
          password: "",
          confirmPassword: "",
          bio: "",
          role: "",
          receiveEmails: false,
          acceptTerms: false,
        }}
        onSubmit={handleSubmit}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mx-6">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <CardContent className="p-6">
            <TabsContent value="personal" className="space-y-4">
              <TextInput
                name="name"
                label="Full Name"
                placeholder="Enter your full name"
                required
                tooltip="Your legal full name"
              />
              
              <TextInput
                name="email"
                label="Email Address"
                placeholder="Enter your email address"
                type="email"
                required
                tooltip="We'll never share your email with anyone else"
              />
              
              <TextInput
                name="phone"
                label="Phone Number"
                placeholder="Enter your phone number"
                tooltip="Optional phone number for contact"
              />
              
              <div className="flex justify-end">
                <Button type="button" onClick={() => setActiveTab("account")}>
                  Next: Account
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="account" className="space-y-4">
              <TextInput
                name="username"
                label="Username"
                placeholder="Choose a username"
                required
                tooltip="Username must be unique and at least 3 characters"
              />
              
              <FormPasswordInput
                name="password"
                label="Password"
                placeholder="Choose a password"
                required
                tooltip="Password must meet all the requirements"
                showStrengthMeter
              />
              
              <FormPasswordInput
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm your password"
                required
                tooltip="Enter the same password again"
              />
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("personal")}>
                  Back: Personal
                </Button>
                <Button type="button" onClick={() => setActiveTab("profile")}>
                  Next: Profile
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="profile" className="space-y-4">
              <TextareaInput
                name="bio"
                label="Bio"
                placeholder="Tell us about yourself"
                tooltip="A brief description about yourself"
                showCharacterCount
                maxLength={500}
              />
              
              <SelectInput
                name="role"
                label="Role"
                options={roleOptions}
                required
                tooltip="Select your primary role"
              />
              
              <DateInput
                name="birthDate"
                label="Birth Date"
                tooltip="Your date of birth"
                fromYear={1900}
                toYear={new Date().getFullYear()}
              />
              
              <Separator className="my-4" />
              
              <CheckboxInput
                name="receiveEmails"
                label="Receive email notifications"
                description="We'll send you updates about your account"
                tooltip="You can unsubscribe at any time"
              />
              
              <CheckboxInput
                name="acceptTerms"
                label="I accept the terms and conditions"
                required
                tooltip="You must accept the terms to continue"
              />
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("account")}>
                  Back: Account
                </Button>
                <Button type="submit">
                  Submit Form
                </Button>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </FormValidationProvider>
      
      <CardFooter className="flex justify-between border-t p-6">
        <p className="text-sm text-muted-foreground">
          All fields marked with * are required
        </p>
      </CardFooter>
    </Card>
  )
}

export default FormValidationExample
