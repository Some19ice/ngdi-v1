"use client"

import { useState, useEffect } from "react"
import { useAuthSession } from "@/hooks/use-auth-session"
import { NewsList } from "./news-list"
import { type NewsItem, type NewsFilters } from "./types"
import { mockNewsData } from "@/lib/mock/news-data"

export function NewsListWrapper() {
  const { user } = useAuthSession()
  const [filters, setFilters] = useState<NewsFilters>({})
  const [items, setItems] = useState<NewsItem[]>([])

  useEffect(() => {
    // Simulate loading data from API
    setItems(mockNewsData)
  }, [])

  // Filter news items based on current filters
  const filteredItems = items.filter((item) => {
    // Filter by category
    if (filters.category && item.category !== filters.category) {
      return false
    }

    // Filter by status
    if (filters.status && item.status !== filters.status) {
      return false
    }

    // Filter by search term (in title or content)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      return (
        item.title.toLowerCase().includes(searchTerm) ||
        item.content.toLowerCase().includes(searchTerm)
      )
    }

    // Filter by visibility
    if (filters.visibility && item.visibility !== filters.visibility) {
      return false
    }

    return true
  })

  const handleFilterChange = (newFilters: NewsFilters) => {
    setFilters(newFilters)
  }

  const handleEdit = (item: NewsItem) => {
    // Implement edit logic
    console.log("Edit item:", item)
  }

  const handleDelete = async (id: string) => {
    // Implement delete logic
    console.log("Delete item:", id)
    // Remove the item from the list for UI feedback
    setItems(items.filter((item) => item.id !== id))
  }

  return (
    <NewsList
      items={filteredItems}
      filters={filters}
      onFilterChange={handleFilterChange}
      onEdit={user?.role === "ADMIN" ? handleEdit : undefined}
      onDelete={user?.role === "ADMIN" ? handleDelete : undefined}
    />
  )
}
