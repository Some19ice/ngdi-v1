import { z } from "zod"

export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
  NODE_OFFICER: "NODE_OFFICER",
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const newsSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.enum(["GENERAL", "ANNOUNCEMENT", "UPDATE", "ALERT"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  publishedAt: z.date().nullable(),
  authorId: z.string(),
  authorName: z.string(),
  tags: z.array(z.string()),
  visibility: z.enum(["PUBLIC", "PRIVATE", "ROLE_BASED"]),
  allowedRoles: z
    .array(z.enum([UserRole.USER, UserRole.ADMIN, UserRole.NODE_OFFICER]))
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type NewsItem = z.infer<typeof newsSchema>

export interface NewsFilters {
  category?: string
  status?: string
  search?: string
  visibility?: string
  dateRange?: {
    from: Date
    to: Date
  }
}

export interface NewsEditorProps {
  item?: NewsItem
  onSave: (
    item: Omit<
      NewsItem,
      "id" | "authorId" | "authorName" | "createdAt" | "updatedAt"
    >
  ) => Promise<void>
  onCancel: () => void
}

export interface NewsListProps {
  items: NewsItem[]
  filters: NewsFilters
  onFilterChange: (filters: NewsFilters) => void
  onEdit?: (item: NewsItem) => void
  onDelete?: (id: string) => void
}

export interface NewsCardProps {
  item: NewsItem
  onEdit?: () => void
  onDelete?: (id: string) => void
}
