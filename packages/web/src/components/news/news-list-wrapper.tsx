"use client"

import { useState, useEffect } from "react"
import { useAuthSession } from "@/hooks/use-auth-session"
import { NewsList } from "./news-list"
import { type NewsItem, type NewsFilters } from "./types"
// Import API client
import { api } from "@/lib/api-client"

export function NewsListWrapper() {
  const { user } = useAuthSession()
  const [filters, setFilters] = useState<NewsFilters>({})
  const [items, setItems] = useState<NewsItem[]>([])

  useEffect(() => {
    // Fetch news data from API
    async function fetchNews() {
      try {
        // Get API URL from environment
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

        // Fetch news from API
        const response = await fetch(`${apiUrl}/news`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && Array.isArray(data.data)) {
            setItems(data.data)
          } else {
            console.error("Invalid news data format")
            setItems([])
          }
        } else {
          console.error("Failed to fetch news:", response.statusText)
          setItems([])
        }
      } catch (error) {
        console.error("Error fetching news:", error)
        setItems([])
      }
    }

    fetchNews()
  }, [filters])

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
