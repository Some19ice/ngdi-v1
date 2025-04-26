import { Metadata } from "next"
import { DocumentationLayout } from "@/components/documentation/layout"
import { ClientTOC } from "@/components/documentation/client-toc"

export const metadata: Metadata = {
  title: "Data & Resources | NGDI Documentation",
  description:
    "Explore the geospatial data and resources available through the NGDI platform.",
}

export default function DataResourcesPage() {
  return (
    <DocumentationLayout>
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 xl:grid xl:grid-cols-[1fr_220px] xl:gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Data & Resources
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Discover the wealth of geospatial data and resources available
            through the NGDI platform to support your projects and
            decision-making.
          </p>

          <div className="space-y-8">
            <section id="available-data">
              <h2 className="text-2xl font-semibold mb-4">Available Data</h2>
              <p className="mb-4">
                The NGDI platform provides access to a comprehensive collection
                of geospatial data covering Nigeria. Our datasets are
                categorized by theme to help you find relevant information
                quickly:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Administrative Boundaries:</strong> States, local
                  government areas, wards, and other administrative divisions
                </li>
                <li>
                  <strong>Demographics:</strong> Population density, age
                  distribution, and socioeconomic indicators
                </li>
                <li>
                  <strong>Transportation:</strong> Road networks, railways,
                  airports, and waterways
                </li>
                <li>
                  <strong>Natural Resources:</strong> Forest coverage, mineral
                  deposits, and water resources
                </li>
                <li>
                  <strong>Agriculture:</strong> Cropland distribution, soil
                  types, and agricultural production zones
                </li>
                <li>
                  <strong>Environment:</strong> Protected areas, biodiversity
                  hotspots, and climate data
                </li>
                <li>
                  <strong>Infrastructure:</strong> Utilities,
                  telecommunications, and public facilities
                </li>
                <li>
                  <strong>Urban Development:</strong> Building footprints, land
                  use, and urban growth patterns
                </li>
              </ul>
            </section>

            <section id="data-quality">
              <h2 className="text-2xl font-semibold mb-4">
                Data Quality and Standards
              </h2>
              <p className="mb-4">
                All data available through the NGDI platform adheres to
                established quality standards to ensure reliability and
                usability:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Data Verification:</strong> Datasets undergo
                  verification procedures before publication
                </li>
                <li>
                  <strong>Metadata:</strong> Comprehensive information about
                  each dataset&apos;s source, date, accuracy, and methodology
                </li>
                <li>
                  <strong>Currency:</strong> Regular updates to maintain
                  relevance, with clear documentation of update frequency
                </li>
                <li>
                  <strong>Coordinate Systems:</strong> Standardized spatial
                  reference systems for consistent mapping
                </li>
                <li>
                  <strong>Interoperability:</strong> Data formatted to work
                  seamlessly across different platforms and applications
                </li>
              </ul>
            </section>

            <section id="featured-datasets">
              <h2 className="text-2xl font-semibold mb-4">Featured Datasets</h2>
              <p className="mb-4">
                Here are some of our most valuable and widely-used datasets:
              </p>
              <div className="grid gap-6 mt-6">
                <div className="border rounded-lg p-5">
                  <h3 className="font-semibold text-lg">
                    Nigeria Administrative Boundaries
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Comprehensive mapping of Nigeria&apos;s administrative
                    divisions from state to ward level, regularly updated to
                    reflect official changes.
                  </p>
                </div>
                <div className="border rounded-lg p-5">
                  <h3 className="font-semibold text-lg">
                    National Land Cover Map
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Detailed classification of Nigeria&apos;s land surface into
                    categories such as forests, grasslands, croplands, water
                    bodies, and built-up areas.
                  </p>
                </div>
                <div className="border rounded-lg p-5">
                  <h3 className="font-semibold text-lg">
                    Nigeria Road Network
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Comprehensive mapping of federal, state, and local roads
                    across Nigeria, including attributes such as road type,
                    surface condition, and connectivity.
                  </p>
                </div>
                <div className="border rounded-lg p-5">
                  <h3 className="font-semibold text-lg">
                    Population Distribution
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    High-resolution population density maps based on the latest
                    census data and enhanced with satellite imagery analysis.
                  </p>
                </div>
              </div>
            </section>

            <section id="educational-resources">
              <h2 className="text-2xl font-semibold mb-4">
                Educational Resources
              </h2>
              <p className="mb-4">
                To help users make the most of NGDI data, we provide a range of
                educational materials:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Tutorials:</strong> Step-by-step guides for common
                  tasks and analyses
                </li>
                <li>
                  <strong>Webinars:</strong> Recorded presentations on data
                  usage and applications
                </li>
                <li>
                  <strong>Case Studies:</strong> Real-world examples of NGDI
                  data applications
                </li>
                <li>
                  <strong>Best Practices:</strong> Guidelines for effective data
                  utilization and analysis
                </li>
                <li>
                  <strong>Glossary:</strong> Explanations of geospatial
                  terminology and concepts
                </li>
              </ul>
            </section>

            <section id="data-access">
              <h2 className="text-2xl font-semibold mb-4">
                Data Access and Usage
              </h2>
              <p className="mb-4">
                The NGDI platform provides multiple ways to access and use data:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Direct Download:</strong> Download datasets in common
                  GIS formats for use in your preferred software
                </li>
                <li>
                  <strong>Web Services:</strong> Connect to NGDI data services
                  directly from GIS applications
                </li>
                <li>
                  <strong>Online Visualization:</strong> Explore data using our
                  built-in map viewer without downloading files
                </li>
                <li>
                  <strong>APIs:</strong> Programmatic access for developers
                  building applications
                </li>
                <li>
                  <strong>Mobile Access:</strong> View and collect data in the
                  field using our mobile applications
                </li>
              </ul>
              <p className="mt-4">
                While many datasets are freely available for public use, some
                specialized data may require specific access permissions. Please
                refer to the usage rights associated with each dataset.
              </p>
            </section>
          </div>
        </div>
        <div className="hidden xl:block">
          <ClientTOC />
        </div>
      </div>
    </DocumentationLayout>
  )
}
