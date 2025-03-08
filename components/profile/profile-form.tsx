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
import { Loader2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function ProfileForm({ profile, onSubmit }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [interestInput, setInterestInput] = useState("")

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile?.name ?? "",
      email: profile?.email ?? "",
      image: profile?.image ?? null,
      coverImage: profile?.coverImage ?? null,
      organization: profile?.organization ?? null,
      department: profile?.department ?? null,
      phone: profile?.phone ?? null,
      bio: profile?.bio ?? null,
      location: profile?.location ?? null,
      interests: profile?.interests ?? [],
      socialLinks: profile?.socialLinks ?? {
        github: null,
        linkedin: null,
        twitter: null,
        facebook: null,
        instagram: null,
        youtube: null,
        twitch: null,
        website: null,
      },
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

  const handleImageUpload = async (
    file: File,
    field: "image" | "coverImage"
  ) => {
    try {
      setUploadError(null)
      const { url } = await uploadProfileImage(file)
      form.setValue(field, url)
      return url
    } catch (error) {
      console.error(`Failed to upload ${field}:`, error)
      setUploadError(
        error instanceof Error ? error.message : `Failed to upload ${field}`
      )
      return null
    }
  }

  const addInterest = () => {
    if (!interestInput.trim()) return

    const currentInterests = form.getValues("interests") || []
    if (currentInterests.includes(interestInput.trim())) return

    form.setValue("interests", [...currentInterests, interestInput.trim()])
    setInterestInput("")
  }

  const removeInterest = (interest: string) => {
    const currentInterests = form.getValues("interests") || []
    form.setValue(
      "interests",
      currentInterests.filter((i) => i !== interest)
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {uploadError && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {uploadError}
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {field.value && (
                          <div className="relative w-full h-32 overflow-hidden rounded-md mb-2">
                            <img
                              src={field.value}
                              alt="Cover"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8"
                              onClick={() => form.setValue("coverImage", null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const input = document.createElement("input")
                              input.type = "file"
                              input.accept = "image/*"
                              input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement)
                                  ?.files?.[0]
                                if (file) {
                                  await handleImageUpload(file, "coverImage")
                                }
                              }
                              input.click()
                            }}
                          >
                            Upload Cover Image
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Recommended size: 1500 x 500px
                          </p>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          const url = await handleImageUpload(file, "image")
                          if (url) field.onChange(url)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
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
                      Email cannot be changed. Contact support if you need to
                      update your email.
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
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

              <FormField
                control={form.control}
                name="interests"
                render={() => (
                  <FormItem>
                    <FormLabel>Interests</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="flex">
                          <Input
                            value={interestInput}
                            onChange={(e) => setInterestInput(e.target.value)}
                            placeholder="Add an interest and press Enter"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                addInterest()
                              }
                            }}
                            className="mr-2"
                          />
                          <Button
                            type="button"
                            onClick={addInterest}
                            disabled={!interestInput.trim()}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {form.watch("interests")?.map((interest, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="px-3 py-1"
                            >
                              {interest}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 ml-1 text-muted-foreground hover:text-foreground"
                                onClick={() => removeInterest(interest)}
                              >
                                <X className="h-3 w-3" />
                                <span className="sr-only">
                                  Remove {interest}
                                </span>
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Add topics you're interested in or expertise areas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Social Links</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="socialLinks.github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="https://github.com/username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialLinks.linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialLinks.twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="https://twitter.com/username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="socialLinks.facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="https://facebook.com/username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialLinks.instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="https://instagram.com/username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="socialLinks.website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Website</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="https://yourwebsite.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  )
}
