"use client"

import { useState } from "react"
import { useAuthSession } from "@/hooks/use-auth-session"
import { NewsList } from "./news-list"
import { type NewsItem, type NewsFilters } from "./types"

export function NewsListWrapper() {
  const { user } = useAuthSession()
  const [filters, setFilters] = useState<NewsFilters>({})
  const [items, setItems] = useState<NewsItem[]>([]) // Replace with actual data fetching

  const handleFilterChange = (newFilters: NewsFilters) => {
    setFilters(newFilters)
    // Implement actual filtering logic
  }

  const handleEdit = (item: NewsItem) => {
    // Implement edit logic
    console.log("Edit item:", item)
  }

  const handleDelete = async (id: string) => {
    // Implement delete logic
    console.log("Delete item:", id)
  }

  return (
    <NewsList
      items={items}
      filters={filters}
      onFilterChange={handleFilterChange}
      onEdit={user?.role === "ADMIN" ? handleEdit : undefined}
      onDelete={user?.role === "ADMIN" ? handleDelete : undefined}
    />
  )
}
