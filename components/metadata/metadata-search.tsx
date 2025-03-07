import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { metadataService } from "@/lib/services/metadata.service"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export function MetadataSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["metadata-search", searchTerm, dateFrom, dateTo],
    queryFn: () =>
      metadataService.searchMetadata({
        search: searchTerm,
        dateFrom,
        dateTo,
        limit: 10,
      }),
    enabled: Boolean(searchTerm || dateFrom || dateTo),
  })

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          placeholder="Search metadata..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.metadata.map((item) => (
            <Link key={item.id} href={`/metadata/${item.id}`}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.abstract}</p>
                  <div className="text-sm text-gray-500">
                    <p>Author: {item.author}</p>
                    <p>Organization: {item.organization}</p>
                    <p>
                      Date: {formatDate(item.dateFrom)} -{" "}
                      {formatDate(item.dateTo)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
