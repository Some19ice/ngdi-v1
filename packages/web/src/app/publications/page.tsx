import { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Download,
  Calendar,
  User,
  BookOpen,
  PenTool,
  ChevronRight,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Publications | National Geo-Spatial Data Infrastructure",
  description:
    "Download official publications, research papers, and documentation related to National Geospatial Data Infrastructure.",
}

interface Publication {
  id: string
  title: string
  authors?: string
  date: string
  description: string
  fileSize?: string
  fileType?: string
  downloadUrl: string
  category: "technical" | "report" | "research"
  tags?: string[]
}

const publications: Publication[] = [
  {
    id: "ngdi-standards-2024",
    title: "NGDI Standards and Guidelines (2024)",
    authors: "NGDI Technical Committee",
    date: "January 2024",
    description:
      "Comprehensive documentation of technical standards and implementation guidelines for NGDI.",
    fileSize: "3.2 MB",
    fileType: "PDF",
    downloadUrl: "/files/ngdi-standards-2024.pdf",
    category: "technical",
    tags: ["standards", "guidelines", "technical"],
  },
  {
    id: "metadata-protocol",
    title: "Metadata Management Protocol",
    authors: "Data Management Working Group",
    date: "November 2023",
    description:
      "Guidelines for creating and maintaining standardized metadata across the NGDI platform.",
    fileSize: "2.1 MB",
    fileType: "PDF",
    downloadUrl: "/files/metadata-protocol.pdf",
    category: "technical",
    tags: ["metadata", "standards"],
  },
  {
    id: "data-quality-framework",
    title: "Data Quality Framework",
    authors: "Quality Assurance Team",
    date: "October 2023",
    description:
      "Standards and procedures for ensuring data quality and consistency.",
    fileSize: "1.8 MB",
    fileType: "PDF",
    downloadUrl: "/files/data-quality-framework.pdf",
    category: "technical",
    tags: ["quality", "standards"],
  },
  {
    id: "annual-report-2023",
    title: "Annual Progress Report 2023",
    authors: "NGDI Secretariat",
    date: "December 2023",
    description:
      "Overview of NGDI achievements, challenges, and future directions.",
    fileSize: "5.4 MB",
    fileType: "PDF",
    downloadUrl: "/files/annual-report-2023.pdf",
    category: "report",
    tags: ["annual", "report"],
  },
  {
    id: "quarterly-bulletin-q4-2023",
    title: "Quarterly Bulletin Q4 2023",
    authors: "NGDI Communications Team",
    date: "December 2023",
    description: "Regular updates on NGDI activities and developments.",
    fileSize: "1.5 MB",
    fileType: "PDF",
    downloadUrl: "/files/quarterly-bulletin-q4-2023.pdf",
    category: "report",
    tags: ["quarterly", "bulletin"],
  },
  {
    id: "geospatial-challenges",
    title:
      "Geospatial Data Management in Nigeria: Challenges and Opportunities",
    authors: "Prof. Adebayo Johnson, Dr. Chioma Eze",
    date: "September 2023",
    description:
      "Research paper on the current state of geospatial data management in Nigeria.",
    fileSize: "2.7 MB",
    fileType: "PDF",
    downloadUrl: "/files/geospatial-challenges.pdf",
    category: "research",
    tags: ["research", "challenges", "opportunities"],
  },
  {
    id: "sdi-developing-nations",
    title: "Implementation of SDI in Developing Nations",
    authors: "Dr. Fatima Abdullahi, Dr. Emmanuel Okafor",
    date: "August 2023",
    description:
      "Comparative study of SDI implementation in developing countries.",
    fileSize: "3.5 MB",
    fileType: "PDF",
    downloadUrl: "/files/sdi-developing-nations.pdf",
    category: "research",
    tags: ["research", "SDI", "developing nations"],
  },
  {
    id: "ngdi-case-study",
    title: "NGDI: A Case Study of Collaborative Governance",
    authors: "Prof. Samuel Nwankwo",
    date: "May 2023",
    description:
      "Analysis of governance structures in the Nigerian Geospatial Data Infrastructure.",
    fileSize: "2.3 MB",
    fileType: "PDF",
    downloadUrl: "/files/ngdi-case-study.pdf",
    category: "research",
    tags: ["research", "governance", "case study"],
  },
]

export default function PublicationsPage() {
  return (
    <div className="py-8 sm:py-12 bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto">
          <div className="space-y-2 mb-6">
            <Badge variant="outline" className="mb-2">
              Resources
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Publications
            </h1>
            <p className="text-xl text-muted-foreground">
              Access and download official publications, reports, and research
              papers
            </p>
          </div>

          <div className="mt-6 mb-8 bg-card p-5 rounded-lg border shadow-sm">
            <p className="text-lg">
              Browse our collection of downloadable publications related to
              National Geospatial Data Infrastructure. All documents are
              available in PDF format and can be downloaded free of charge.
            </p>
          </div>

          <Tabs defaultValue="all" className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Publications</TabsTrigger>
              <TabsTrigger value="technical">Technical Documents</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="research">Research Papers</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {publications.map((pub) => (
                  <PublicationCard key={pub.id} publication={pub} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="technical" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {publications
                  .filter((pub) => pub.category === "technical")
                  .map((pub) => (
                    <PublicationCard key={pub.id} publication={pub} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="reports" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {publications
                  .filter((pub) => pub.category === "report")
                  .map((pub) => (
                    <PublicationCard key={pub.id} publication={pub} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="research" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {publications
                  .filter((pub) => pub.category === "research")
                  .map((pub) => (
                    <PublicationCard key={pub.id} publication={pub} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function PublicationCard({ publication }: { publication: Publication }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">
            {publication.title}
          </CardTitle>
          <FileIcon fileType={publication.fileType} />
        </div>
        {publication.authors && (
          <div className="flex items-center text-sm text-muted-foreground space-x-1">
            <User className="h-3.5 w-3.5 mr-1" />
            <span>{publication.authors}</span>
          </div>
        )}
        <div className="flex items-center text-sm text-muted-foreground space-x-1">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          <span>{publication.date}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-muted-foreground">
          {publication.description}
        </p>
        {publication.tags && (
          <div className="flex flex-wrap gap-1 mt-3">
            {publication.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 border-t">
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-muted-foreground">
            {publication.fileSize} {publication.fileType}
          </div>
          <Button size="sm" variant="outline" className="flex items-center">
            <Download className="mr-1 h-4 w-4" />
            Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

function FileIcon({ fileType }: { fileType?: string }) {
  let icon = <FileText className="h-5 w-5 text-primary" />

  switch (fileType?.toLowerCase()) {
    case "pdf":
      return (
        <div className="bg-red-100 dark:bg-red-900/20 p-1 rounded-md">
          <FileText className="h-5 w-5 text-red-500 dark:text-red-400" />
        </div>
      )
    default:
      return <div className="bg-primary/10 p-1 rounded-md">{icon}</div>
  }
}
