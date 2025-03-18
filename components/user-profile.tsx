"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useApi, useMutation } from "@/hooks/use-api"
import { api } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { UserUpdateRequest } from "@/types/user"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  organization: z
    .string()
    .min(2, "Organization must be at least 2 characters")
    .optional()
    .nullable(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function UserProfile() {
  const {
    data: user,
    error,
    isLoading,
    mutate: refreshUser,
  } = useApi(() => api.getCurrentUser(), {
    onError: (error) => {
      console.error("Failed to fetch user profile:", error)
    },
  })

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      organization: "",
    },
  })

  useEffect(() => {
    if (user) {
      console.log("User data:", user)
      form.reset({
        name: user.name || "",
        email: user.email,
        organization: user.organization || "",
      })
    }
  }, [user, form])

  const { mutate: updateProfile, isLoading: isUpdating } = useMutation<
    any,
    [UserUpdateRequest]
  >((data: UserUpdateRequest) => api.updateUser(data), {
    successMessage: "Profile updated successfully",
    invalidateQueries: [() => api.getCurrentUser()],
    onSuccess: () => {
      refreshUser()
    },
  })

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      // Use direct fetch for more control
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

      // Get the auth token from the auth client
      let token
      try {
        token = await api.getAuthToken()
      } catch (err) {
        console.error("Failed to get auth token:", err)
      }

      const updateData = {
        name: data.name,
        email: data.email,
        organization: data.organization || undefined, // Send undefined instead of empty string
      }

      console.log("Updating profile with:", updateData)

      const response = await fetch(`${apiUrl}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Profile update failed:", {
          status: response.status,
          statusText: response.statusText,
          errorText,
        })
        throw new Error(
          `Failed to update profile: ${response.statusText} - ${errorText}`
        )
      }

      // On success
      await response.json() // Consume the response
      refreshUser()

      // Show success message
      alert("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert(error.message || "Failed to update profile")
    }
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            Error loading profile: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-1/2" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your organization"
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
