"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { UserRole, Permissions } from "@/lib/auth/types"
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
  DialogTrigger,
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
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Search,
  Filter,
  Calendar,
  Tag,
  User,
  Eye,
  MessageSquare,
  Share2,
  ChevronRight,
  Newspaper,
  PlusCircle,
  HelpCircle,
} from "lucide-react"
import { redirect } from "next/navigation"

// Mock data - replace with actual API call
const mockNews = [
  {
    id: "1",
    title: "NGDI Launches New Geospatial Data Portal",
    excerpt:
      "The National Geospatial Data Infrastructure (NGDI) has launched a new web portal to improve access to geospatial data across Nigeria.",
    content: `The National Geospatial Data Infrastructure (NGDI) has launched a new web portal to improve access to geospatial data across Nigeria. The portal aims to streamline data sharing and collaboration between government agencies, researchers, and the private sector.

    Key features of the new portal include:
    - Advanced search capabilities
    - Interactive map interface
    - Metadata management system
    - Real-time data updates
    
    The launch event was attended by representatives from various government agencies and stakeholders in the geospatial sector.`,
    category: "Announcements",
    author: "NGDI Communications Team",
    date: "2024-02-05",
    image: "https://example.com/news-1.jpg",
    tags: ["portal", "launch", "technology"],
    views: 1245,
    comments: 23,
    featured: true,
  },
  {
    id: "2",
    title: "Workshop: Introduction to Geospatial Data Standards",
    excerpt:
      "NGDI is organizing a three-day workshop on geospatial data standards and best practices for data management.",
    content: `NGDI is organizing a three-day workshop on geospatial data standards and best practices for data management. The workshop will cover important topics including:

    1. International metadata standards
    2. Data quality assessment
    3. Interoperability guidelines
    4. Data validation techniques

    The workshop is open to all stakeholders in the geospatial sector.`,
    category: "Events",
    author: "Training Department",
    date: "2024-02-03",
    image: "https://example.com/news-2.jpg",
    tags: ["workshop", "training", "standards"],
    views: 856,
    comments: 12,
    featured: false,
  },
  {
    id: "3",
    title: "New Partnership with International Space Agency",
    excerpt:
      "NGDI has signed a memorandum of understanding with the International Space Agency for collaborative satellite imagery projects.",
    content: `NGDI has signed a memorandum of understanding with the International Space Agency for collaborative satellite imagery projects. This partnership will enhance Nigeria's access to high-resolution satellite imagery and technical expertise.

    The collaboration will focus on:
    - Satellite imagery acquisition
    - Technical capacity building
    - Joint research projects
    - Technology transfer

    This partnership marks a significant milestone in Nigeria's geospatial development journey.`,
    category: "Partnerships",
    author: "External Relations Office",
    date: "2024-02-01",
    image: "https://example.com/news-3.jpg",
    tags: ["partnership", "satellite", "international"],
    views: 567,
    comments: 8,
    featured: true,
  },
]

const categories = [
  "All Categories",
  "Announcements",
  "Events",
  "Partnerships",
  "Technology",
  "Research",
  "Policy Updates",
]

export default function NewsPage() {
  const { user, can } = useAuth()

  if (!user) {
    redirect("/login")
  }

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedArticle, setSelectedArticle] = useState<
    (typeof mockNews)[0] | null
  >(null)

  const filteredNews = mockNews.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "All Categories" ||
      item.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const featuredNews = filteredNews.filter((item) => item.featured)
  const regularNews = filteredNews.filter((item) => !item.featured)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Latest News</h1>
          <p className="text-muted-foreground mt-2">
            Stay updated with the latest news and announcements from NGDI
          </p>
        </div>
        {can(Permissions.MANAGE_SETTINGS) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add News
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create a new news article (Admin only)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2 flex-1 max-w-sm relative">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full relative">
                  <Input
                    placeholder="Search news..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-8"
                  />
                  <HelpCircle className="h-4 w-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Search through news titles and content. You can search by:
                </p>
                <ul className="list-disc list-inside mt-1 text-sm">
                  <li>Article title</li>
                  <li>Article content</li>
                  <li>Author name</li>
                  <li>Tags</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
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
                <HelpCircle className="h-4 w-4 text-muted-foreground absolute right-8 top-1/2 -translate-y-1/2" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Filter news by category:</p>
              <ul className="list-disc list-inside mt-1 text-sm">
                <li>Announcements - Official NGDI announcements</li>
                <li>Events - Upcoming workshops and conferences</li>
                <li>Partnerships - Collaboration news</li>
                <li>Technology - Technical updates</li>
                <li>Research - Research findings and papers</li>
                <li>Policy Updates - Changes in policies and guidelines</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {featuredNews.length > 0 && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {featuredNews.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedArticle(item)}
              >
                <div className="relative aspect-video">
                  {/* Replace with actual image */}
                  <div className="absolute inset-0 bg-muted animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge
                    className="absolute top-4 left-4 bg-ngdi-green-500"
                    variant="secondary"
                  >
                    Featured
                  </Badge>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-semibold text-white">
                      {item.title}
                    </h3>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-muted-foreground">{item.excerpt}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {item.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {item.date}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Separator />
        </>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {regularNews.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedArticle(item)}
          >
            <div className="relative aspect-video">
              {/* Replace with actual image */}
              <div className="absolute inset-0 bg-muted animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <Badge className="absolute top-4 left-4" variant="secondary">
                {item.category}
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm line-clamp-2">
                {item.excerpt}
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {item.date}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {item.views}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {item.comments}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!selectedArticle}
        onOpenChange={() => setSelectedArticle(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedArticle?.title}</DialogTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {selectedArticle?.author}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {selectedArticle?.date}
              </div>
              <Badge variant="secondary">{selectedArticle?.category}</Badge>
            </div>
          </DialogHeader>
          <div className="relative aspect-video w-full mb-4">
            {/* Replace with actual image */}
            <div className="absolute inset-0 bg-muted animate-pulse" />
          </div>
          <div className="prose max-w-none">
            {selectedArticle?.content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="flex items-center justify-between mt-6">
            <div className="flex flex-wrap gap-2">
              {selectedArticle?.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  <Tag className="mr-1 h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
