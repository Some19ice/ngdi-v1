"use client"

import { useSearchParams } from "next/navigation"
import { createContext, useContext, ReactNode } from "react"

// Create a context for search params
const SearchParamsContext = createContext<URLSearchParams | null>(null)

// Hook to use search params
export function useSearchParamsContext() {
  const context = useContext(SearchParamsContext)
  if (!context) {
    throw new Error("useSearchParamsContext must be used within a SearchParamsProvider")
  }
  return context
}

// Provider component
export function SearchParamsProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()
  
  return (
    <SearchParamsContext.Provider value={searchParams}>
      {children}
    </SearchParamsContext.Provider>
  )
}
