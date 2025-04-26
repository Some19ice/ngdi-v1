import { Suspense } from "react"
import { NewsListWrapper } from "@/components/news/news-list-wrapper"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export const metadata = {
  title: "News",
  description: "Latest news and updates",
}

export default function NewsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">News</h1>
        <p className="text-muted-foreground">
          Stay up to date with the latest news and updates
        </p>
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        <NewsListWrapper />
      </Suspense>
    </div>
  )
}
