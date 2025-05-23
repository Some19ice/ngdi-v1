"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthSession } from "@/hooks/use-auth-session"
import api from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"

const profileSchema = z.object({
  organization: z.string().min(2, "Organization must be at least 2 characters"),
  department: z.string().optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number")
    .optional(),
})

type ProfileValues = z.infer<typeof profileSchema>

export default function NewUserPage() {
  const router = useRouter()
  const { session, user, refreshSession } = useAuthSession()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      organization: "",
      department: "",
      phone: "",
    },
  })

  async function onSubmit(data: ProfileValues) {
    setIsSubmitting(true)

    try {
      // Try a direct fetch call to avoid any middleware issues
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

      // Get token from session - safer than localStorage
      const token = session?.accessToken

      console.log("Using direct fetch with token available:", !!token)

      // Ensure name is at least 2 characters
      const userName =
        user?.name && user.name.length >= 2 ? user.name : "User Profile" // Default name that meets 2 character minimum

      const response = await fetch(`${apiUrl}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: userName,
          email: user?.email || "",
          organization: data.organization,
          department: data.department || undefined,
          phone: data.phone || undefined,
        }),
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

      await response.json() // Consume the response

      // Refresh the session to get updated user data
      await refreshSession()

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      // Profile is now complete

      // Small delay to ensure cookie and session update is processed
      setTimeout(() => {
        // Redirect to home
        router.push("/")
      }, 500)
    } catch (error: any) {
      // Type error as any to fix TypeScript error
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description:
          error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to NGDI Portal</CardTitle>
          <CardDescription>
            Please complete your profile to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <FormControl>
                      <Input placeholder="Your organization" {...field} />
                    </FormControl>
                    <FormDescription>
                      The organization you represent
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Your department" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+234 123 456 7890"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include country code (e.g., +234 for Nigeria)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Complete Profile"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
