"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  type ProfileFormProps,
  profileFormSchema,
  type ProfileFormValues,
} from "./types"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { ProfileImageUpload } from "./profile-image-upload"
import { uploadProfileImage } from "@/lib/api/profile"
import { Loader2 } from "lucide-react"

export function ProfileForm({ profile, onSubmit }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile?.name ?? "",
      email: profile?.email ?? "",
      image: profile?.image ?? null,
      organization: profile?.organization ?? null,
      department: profile?.department ?? null,
      phone: profile?.phone ?? null,
      bio: profile?.bio ?? null,
      location: profile?.location ?? null,
      socialLinks: profile?.socialLinks ?? null,
      preferences: profile?.preferences ?? {
        emailNotifications: true,
        newsletter: true,
        twoFactorEnabled: false,
      },
    },
  })

  const handleSubmit = async (values: ProfileFormValues) => {
    try {
      setIsSubmitting(true)
      setUploadError(null)
      await onSubmit(values)
      form.reset(values)
    } catch (error) {
      console.error("Failed to update profile:", error)
      setUploadError(
        error instanceof Error ? error.message : "Failed to update profile"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      setUploadError(null)
      const { url } = await uploadProfileImage(file)
      form.setValue("image", url)
      return url
    } catch (error) {
      console.error("Failed to upload image:", error)
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload image"
      )
      return null
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {uploadError && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {uploadError}
          </div>
        )}

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Picture</FormLabel>
              <FormControl>
                <ProfileImageUpload
                  currentImage={field.value}
                  onUpload={async (file) => {
                    const url = await handleImageUpload(file)
                    if (url) field.onChange(url)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your name" />
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
                  {...field}
                  type="email"
                  placeholder="Enter your email"
                  disabled
                />
              </FormControl>
              <FormDescription>
                Email cannot be changed. Contact support if you need to update
                your email.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Enter your organization"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Enter your department"
                />
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
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Enter your phone number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder="Tell us about yourself"
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Enter your location"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  )
}
