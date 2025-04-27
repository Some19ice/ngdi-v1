"use client"

import { useState, useEffect } from "react"
import { useAuthSession } from "@/hooks/use-auth-session"
import { Permissions } from "@/lib/auth/types"
import { UserRole } from "@/lib/auth/constants"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Filter,
  Download,
  Eye,
  MapPin,
  Calendar,
  Tag,
  Building2,
  Loader2,
} from "lucide-react"
import {
  getGalleryItems,
  getGalleryCategories,
  GalleryItem,
} from "@/lib/api/gallery"

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadGalleryData() {
      try {
        setIsLoading(true)
        const [items, cats] = await Promise.all([
          getGalleryItems(),
          getGalleryCategories(),
        ])
        setGalleryItems(items)
        setCategories(cats)
        setError(null)
      } catch (err) {
        console.error("Failed to load gallery data:", err)
        setError("Failed to load gallery data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadGalleryData()
  }, [])

  const filteredItems = galleryItems.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "All Categories" ||
      item.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Image Gallery</h1>
        <p className="text-muted-foreground mt-2">
          Browse and download geospatial imagery and maps
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading gallery items...</p>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 rounded-lg p-8 text-center">
          <h2 className="text-xl font-medium mb-2 text-destructive">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-medium mb-2">No results found</h2>
          <p className="text-muted-foreground">
            We couldn&apos;t find any gallery items matching your search. Try
            using different keywords or categories.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div
                className="relative aspect-video cursor-pointer overflow-hidden"
                onClick={() => setSelectedImage(item)}
              >
                {/* Replace the div below with an actual image component */}
                <div className="absolute inset-0 bg-muted animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {item.title}
                  </h3>
                </div>
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {item.organization}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {item.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {item.date}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{item.downloads} downloads</span>
                  <span>{item.views} views</span>
                </div>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title}</DialogTitle>
            <DialogDescription>
              {selectedImage?.organization} • {selectedImage?.location}
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video w-full relative">
            {/* Replace the div below with an actual image component */}
            <div className="absolute inset-0 bg-muted animate-pulse" />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {selectedImage?.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
