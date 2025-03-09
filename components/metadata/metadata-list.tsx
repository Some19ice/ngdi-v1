"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { metadataService } from "@/lib/services/metadata.service"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MetadataItem, MetadataSearchResponse } from "@/types/metadata"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export function MetadataList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")

  const { data, isLoading, refetch } = useQuery<MetadataSearchResponse>({
    queryKey: ["metadata", page, search, category],
    queryFn: () =>
      metadataService.searchMetadata({
        page,
        limit: 10,
        search,
        category,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
  })

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this metadata?")) {
      try {
        await metadataService.deleteMetadata(id)
        refetch()
      } catch (error) {
        console.error("Metadata deletion failed:", error)
      }
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search metadata..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Input
          placeholder="Filter by category..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Date Range</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.metadata.map((item: MetadataItem) => (
            <TableRow key={item.id}>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.author}</TableCell>
              <TableCell>{item.organization}</TableCell>
              <TableCell>
                {formatDate(item.dateFrom)} - {formatDate(item.dateTo)}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/metadata/${item.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                  <Link href={`/metadata/${item.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center">
        <div>Total items: {data?.total || 0}</div>
        <div className="flex gap-2">
          <Button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={() => setPage(page + 1)}
            disabled={!data || page >= data.totalPages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
