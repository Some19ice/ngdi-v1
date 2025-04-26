"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

interface SearchParamsWrapperProps {
  setSearchQuery: (value: string) => void
  setSelectedCategory: (value: string) => void
  setSelectedStatus: (value: string) => void
  setSelectedValidation: (value: string) => void
  setPage: (value: number) => void
  setPageSize: (value: number) => void
}

export function SearchParamsWrapper({
  setSearchQuery,
  setSelectedCategory,
  setSelectedStatus,
  setSelectedValidation,
  setPage,
  setPageSize,
}: SearchParamsWrapperProps) {
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get search parameters from URL (with null safety)
    const pageParam = searchParams?.get("page") ?? null
    const limitParam = searchParams?.get("limit") ?? null
    const searchParam = searchParams?.get("search") ?? null
    const categoryParam = searchParams?.get("category") ?? null
    const statusParam = searchParams?.get("status") ?? null
    const validationParam = searchParams?.get("validation") ?? null

    // Update state with URL parameters
    if (searchParam) setSearchQuery(searchParam)
    if (categoryParam) setSelectedCategory(categoryParam)
    if (statusParam) setSelectedStatus(statusParam)
    if (validationParam) setSelectedValidation(validationParam)
    if (pageParam) setPage(parseInt(pageParam))
    if (limitParam) setPageSize(parseInt(limitParam))
  }, [
    searchParams,
    setSearchQuery,
    setSelectedCategory,
    setSelectedStatus,
    setSelectedValidation,
    setPage,
    setPageSize,
  ])

  return null
}
