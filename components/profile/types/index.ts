import { z } from "zod"

export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
  NODE_OFFICER: "NODE_OFFICER",
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const profileSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  image: z.string().nullable(),
  coverImage: z.string().nullable().optional(),
  organization: z.string().nullable(),
  department: z.string().nullable(),
  phone: z.string().nullable(),
  role: z.enum([UserRole.USER, UserRole.ADMIN, UserRole.NODE_OFFICER]),
  bio: z.string().max(500, "Bio must be less than 500 characters").nullable(),
  location: z.string().nullable(),
  verified: z.boolean().optional().default(false),
  interests: z.array(z.string()).nullable().optional(),
  socialLinks: z
    .object({
      twitter: z.string().url().nullable(),
      linkedin: z.string().url().nullable(),
      github: z.string().url().nullable(),
      facebook: z.string().url().nullable().optional(),
      instagram: z.string().url().nullable().optional(),
      youtube: z.string().url().nullable().optional(),
      twitch: z.string().url().nullable().optional(),
      website: z.string().url().nullable().optional(),
    })
    .nullable(),
  preferences: z.object({
    emailNotifications: z.boolean(),
    newsletter: z.boolean(),
    twoFactorEnabled: z.boolean(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Profile = z.infer<typeof profileSchema>

export const profileFormSchema = profileSchema.omit({
  id: true,
  role: true,
  createdAt: true,
  updatedAt: true,
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export interface ProfileCardProps {
  profile: Profile
  isEditable?: boolean
}

export interface ProfileFormProps {
  profile?: Profile
  onSubmit: (values: ProfileFormValues) => Promise<void>
}

export interface ProfileImageUploadProps {
  currentImage?: string | null
  onUpload: (file: File) => Promise<void>
}

export interface ProfileSettingsProps {
  profile: Profile
  onUpdate: (values: Partial<Profile>) => Promise<void>
}

// Helper to format Supabase user data into Profile structure
export function formatSupabaseUserToProfile(user: any): Profile {
  return {
    id: user.id,
    name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
    email: user.email || "unknown@example.com",
    image: user.user_metadata?.avatar_url || null,
    coverImage: user.user_metadata?.coverImage || null,
    organization: user.user_metadata?.organization || null,
    department: user.user_metadata?.department || null,
    phone: user.user_metadata?.phone || null,
    role: (user.user_metadata?.role as UserRole) || UserRole.USER,
    bio: user.user_metadata?.bio || null,
    location: user.user_metadata?.location || null,
    verified: user.user_metadata?.verified || false,
    interests: user.user_metadata?.interests || null,
    socialLinks: user.user_metadata?.socialLinks || null,
    preferences: user.user_metadata?.preferences || {
      emailNotifications: true,
      newsletter: true,
      twoFactorEnabled: false,
    },
    createdAt: new Date(user.created_at || Date.now()),
    updatedAt: new Date(user.updated_at || Date.now()),
  }
}
