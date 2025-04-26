"use client"

import { type NewsListProps } from "./types"
import { NewsCard } from "./news-card"
import { NewsFilters } from "./news-filters"

export function NewsList({
  items,
  filters,
  onFilterChange,
  onEdit,
  onDelete,
}: NewsListProps) {
  return (
    <div className="space-y-6">
      <NewsFilters filters={filters} onChange={onFilterChange} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <NewsCard
            key={item.id}
            item={item}
            onEdit={onEdit ? () => onEdit(item) : undefined}
            onDelete={onDelete ? () => onDelete(item.id) : undefined}
          />
        ))}
      </div>
      {items.length === 0 && (
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">No news items found</p>
        </div>
      )}
    </div>
  )
}
