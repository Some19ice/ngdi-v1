import { ReactNode } from "react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DocSearch } from "@/components/documentation/search"

interface DocumentationLayoutProps {
  children: ReactNode
}

interface DocLink {
  title: string
  href: string
}

const mainCategories: DocLink[] = [
  {
    title: "About NGDI",
    href: "/documentation/about-ngdi",
  },
  {
    title: "User Guide",
    href: "/documentation/user-guide",
  },
  {
    title: "Data & Resources",
    href: "/documentation/data-resources",
  },
]

const topicLinks: DocLink[] = [
  {
    title: "Project Overview",
    href: "/documentation/about-ngdi/overview",
  },
  {
    title: "Our Mission",
    href: "/documentation/about-ngdi/mission",
  },
  {
    title: "Partnerships",
    href: "/documentation/about-ngdi/partnerships",
  },
  {
    title: "Impact Stories",
    href: "/documentation/about-ngdi/impact",
  },
]

export function DocumentationLayout({ children }: DocumentationLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex items-center justify-between h-16 gap-6 px-4 md:gap-10">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="w-full md:w-auto justify-start">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <div className="h-full py-6 pl-8 pr-6 lg:py-8">
            <div className="mb-6">
              <DocSearch />
            </div>
            <nav className="grid gap-2">
              <p className="font-medium text-sm mb-4">Main Categories</p>
              {mainCategories.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  {link.title}
                </Link>
              ))}
              <p className="font-medium text-sm mt-6 mb-4">NGDI Topics</p>
              {topicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
          <div className="mx-auto w-full min-w-0">{children}</div>
        </main>
      </div>
    </div>
  )
}
