import { Metadata } from "next"
import {
  Users,
  Building,
  GraduationCap,
  MapPin,
  Briefcase,
  LandPlot,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "NGDI Committee | National Geo-Spatial Data Infrastructure",
  description:
    "Learn about the NGDI Committee structure, composition, and responsibilities in Nigeria's Geo-Spatial Data Infrastructure.",
}

export default function CommitteePage() {
  return (
    <div className="py-8 sm:py-12 bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto">
          <div className="space-y-2 mb-6">
            <Badge variant="outline" className="mb-2">
              Governance
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              NGDI Committee
            </h1>
            <p className="text-xl text-muted-foreground">
              Coordinating geospatial activities across Nigeria
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <div className="bg-card rounded-lg p-5 border shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <p className="lead text-lg">
                The NGDI committee, with secretariat hosted by NASRDA, is a
                multidisciplinary body that oversees the development and
                implementation of Nigeria&apos;s Geo-Spatial Data
                Infrastructure. The committee plays a crucial role in
                coordinating geospatial activities across different sectors and
                ensuring alignment with national objectives.
              </p>
            </div>

            <Tabs defaultValue="structure" className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="structure">Structure</TabsTrigger>
                <TabsTrigger value="composition">Composition</TabsTrigger>
                <TabsTrigger value="responsibilities">
                  Responsibilities
                </TabsTrigger>
              </TabsList>

              <TabsContent value="structure" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-primary" />
                      Committee Structure
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      The NGDI committee is composed of 27 persons. The chairman
                      is elected in rotation from among themselves for a maximum
                      of two consecutive terms of one year each. The committee
                      brings together representatives from government agencies,
                      academic institutions, and the private sector to ensure
                      comprehensive oversight of geospatial data management in
                      Nigeria.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                      <StatCard
                        icon={<Building className="h-5 w-5 text-blue-500" />}
                        title="Government"
                        value="11 Agencies"
                      />
                      <StatCard
                        icon={
                          <GraduationCap className="h-5 w-5 text-green-500" />
                        }
                        title="Academia"
                        value="4 Institutions"
                      />
                      <StatCard
                        icon={<Briefcase className="h-5 w-5 text-amber-500" />}
                        title="Private Sector"
                        value="4 Organizations"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="composition" className="mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <CompositionCard
                      icon={<Building className="h-5 w-5 text-primary" />}
                      title="Coordinating Agency"
                      description="Representatives from NASRDA"
                      items={[
                        "Two persons fully employed by the coordinating agency (NASRDA) whose rank is not less than a directorate cadre or its equivalent",
                      ]}
                    />

                    <div className="mt-4">
                      <CompositionCard
                        icon={
                          <GraduationCap className="h-5 w-5 text-primary" />
                        }
                        title="Academic Institutions"
                        description="Representatives from universities and polytechnics"
                        items={[
                          "Two persons not below the rank of senior lecturer from the relevant academic departments of universities, with the universities selected in rotation",
                          "Two persons not below the rank of principal lecturer from the relevant academic departments of polytechnics and monotechnics, with the institutions selected in rotation",
                        ]}
                      />
                    </div>

                    <div className="mt-4">
                      <CompositionCard
                        icon={<MapPin className="h-5 w-5 text-primary" />}
                        title="Geopolitical Representation"
                        description="Representatives from the six geopolitical zones"
                        items={[
                          "One person from each of the six geopolitical zones chosen from any of the states nodal agencies and whose rank is not less than that of a directorate cadre or its equivalent (The states shall be selected in rotation)",
                        ]}
                      />
                    </div>
                  </div>

                  <div>
                    <CompositionCard
                      icon={<Briefcase className="h-5 w-5 text-primary" />}
                      title="Private Sector & NGOs"
                      description="Representatives from private organizations"
                      items={[
                        "Four persons chosen from GI related private sector, inter-governmental and non-governmental organizations",
                      ]}
                    />

                    <div className="mt-4">
                      <CompositionCard
                        icon={<LandPlot className="h-5 w-5 text-primary" />}
                        title="Federal Ministries and Agencies"
                        description="Representatives from key government bodies"
                        items={[
                          "Ministry of Defense (Armed Forces)",
                          "Office of the Surveyor-General of the Federation",
                          "Ministry of Agriculture and Water Resources",
                          "Ministry of Mines and Steel Development",
                          "National Planning Commission",
                          "Federal Capital Development Authority",
                          "Nigeria National Petroleum Corporation",
                          "Ministry of Environment and Housing",
                          "Ministry of Transport",
                          "Ministry of Finance",
                          "National Population Commission",
                        ]}
                        columns={2}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="responsibilities" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Key Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        {
                          title: "Policy Development",
                          description:
                            "Development of policies and guidelines for geospatial data management",
                        },
                        {
                          title: "Coordination",
                          description:
                            "Coordination of geospatial activities across different sectors",
                        },
                        {
                          title: "Standards Promotion",
                          description:
                            "Promotion of standards and best practices",
                        },
                        {
                          title: "Capacity Building",
                          description:
                            "Oversight of capacity building initiatives",
                        },
                        {
                          title: "Monitoring",
                          description:
                            "Monitoring and evaluation of NGDI implementation",
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="bg-muted/50 p-4 rounded-lg hover:bg-muted transition-colors"
                        >
                          <h3 className="font-medium text-primary mb-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* NGDI Technical Framework Section */}
            <div className="mt-10 mb-8">
              <h2 className="text-2xl font-bold mb-4">
                NGDI Technical Framework
              </h2>
              <p className="mb-6 text-muted-foreground">
                The Nigerian NGDI Technical Framework illustrates the
                infrastructure's architecture and information flow between
                various components including nodal agencies, users, and the
                central metadata repository. This framework enables seamless
                data sharing and collaboration among stakeholders.
              </p>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
                <figure>
                  <img
                    src="/images/NGDI-Framework.jpeg"
                    alt="Nigerian NGDI Technical Framework"
                    className="mx-auto rounded-lg max-w-full h-auto"
                  />
                  <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                    Figure 2: Nigerian NGDI Technical Framework - Architecture
                    for geospatial data sharing and management
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode
  title: string
  value: string
}) {
  return (
    <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center text-center">
      <div className="mb-2">{icon}</div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="font-bold">{value}</p>
    </div>
  )
}

function CompositionCard({
  icon,
  title,
  description,
  items,
  columns = 1,
}: {
  icon: React.ReactNode
  title: string
  description: string
  items: string[]
  columns?: 1 | 2
}) {
  return (
    <Card className="animate-in fade-in-50 duration-500">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <div className="mr-2">{icon}</div>
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <ul
          className={`space-y-1.5 ${columns === 2 ? "grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1.5" : ""}`}
        >
          {items.map((item, index) => (
            <li key={index} className="flex items-start">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                <span className="text-xs font-bold text-primary">
                  {index + 1}
                </span>
              </div>
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
