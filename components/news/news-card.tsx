"use client"

import { format } from "date-fns"
import { MoreVertical, Edit2, Trash2 } from "lucide-react"
import { type NewsCardProps } from "./types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function NewsCard({ item, onEdit, onDelete }: NewsCardProps) {
  const statusColor = {
    DRAFT: "bg-yellow-100 text-yellow-800",
    PUBLISHED: "bg-green-100 text-green-800",
    ARCHIVED: "bg-gray-100 text-gray-800",
  }[item.status]

  const categoryColor = {
    GENERAL: "bg-blue-100 text-blue-800",
    ANNOUNCEMENT: "bg-purple-100 text-purple-800",
    UPDATE: "bg-indigo-100 text-indigo-800",
    ALERT: "bg-red-100 text-red-800",
  }[item.category]

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="line-clamp-2">{item.title}</CardTitle>
            <CardDescription>
              By {item.authorName} • {format(item.createdAt, "PPP")}
            </CardDescription>
          </div>
          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(item.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className={categoryColor}>
            {item.category}
          </Badge>
          <Badge variant="secondary" className={statusColor}>
            {item.status}
          </Badge>
          {item.visibility !== "PUBLIC" && (
            <Badge variant="outline">{item.visibility}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {item.content}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        {item.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </CardFooter>
    </Card>
  )
}
