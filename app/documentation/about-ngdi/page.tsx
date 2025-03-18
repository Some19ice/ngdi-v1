import { Metadata } from "next"
import { DocumentationLayout } from "@/components/documentation/layout"
import { ClientTOC } from "@/components/documentation/client-toc"

export const metadata: Metadata = {
  title: "About NGDI | Documentation",
  description: "Learn about the NGDI project, its mission, and its impact.",
}

export default function AboutNGDIPage() {
  return (
    <DocumentationLayout>
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 xl:grid xl:grid-cols-[1fr_220px] xl:gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">About NGDI</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Learn about the National Geospatial Data Infrastructure (NGDI)
            project, its vision, and how it&apos;s transforming Nigeria&apos;s
            geospatial landscape.
          </p>

          <div className="space-y-8">
            <section id="mission">
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="mb-4">
                The National Geospatial Data Infrastructure (NGDI) project aims
                to create a unified, accessible platform for Nigeria&apos;s
                geospatial data. Our mission is to enable better decision-making
                through accurate geospatial information that serves government
                agencies, businesses, researchers, and citizens alike.
              </p>
              <p>
                By providing a comprehensive, standardized framework for
                collecting, processing, storing, and distributing geospatial
                data, NGDI serves as the foundation for Nigeria&apos;s digital
                transformation across multiple sectors including agriculture,
                urban planning, emergency management, and natural resource
                conservation.
              </p>
            </section>

            <section id="vision">
              <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
              <p className="mb-4">
                We envision a Nigeria where accurate, up-to-date geospatial data
                is readily available to all stakeholders, powering informed
                decisions and sustainable development. Through NGDI, we aim to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Eliminate data silos between government agencies and
                  organizations
                </li>
                <li>
                  Standardize geospatial data formats and quality across Nigeria
                </li>
                <li>
                  Make spatial data accessible to both experts and the general
                  public
                </li>
                <li>
                  Support evidence-based policy and decision-making nationwide
                </li>
                <li>
                  Drive innovation in resource management and public service
                  delivery
                </li>
              </ul>
            </section>

            <section id="background">
              <h2 className="text-2xl font-semibold mb-4">Background</h2>
              <p className="mb-4">
                The NGDI initiative was established in response to the growing
                need for coordinated geospatial information to support
                Nigeria&apos;s development goals. Recognizing the challenges of
                fragmented data systems and inconsistent methodologies across
                different agencies, the project brings together key stakeholders
                to develop standards and infrastructure for unified geospatial
                data management.
              </p>
              <p>
                With the support of government agencies, academic institutions,
                and international partners, NGDI is building a robust ecosystem
                for geospatial data that aligns with global best practices while
                addressing Nigeria&apos;s unique challenges and opportunities.
              </p>
            </section>

            <section id="key-components">
              <h2 className="text-2xl font-semibold mb-4">Key Components</h2>
              <p className="mb-4">
                The NGDI platform consists of several interconnected components:
              </p>
              <ol className="list-decimal pl-6 space-y-4">
                <li>
                  <p className="font-medium">Geospatial Data Portal</p>
                  <p className="text-muted-foreground">
                    A centralized repository for accessing and sharing
                    geospatial datasets from various sources across Nigeria.
                  </p>
                </li>
                <li>
                  <p className="font-medium">
                    Interactive Maps and Visualizations
                  </p>
                  <p className="text-muted-foreground">
                    Tools that enable users to explore, analyze and visualize
                    spatial data through intuitive interfaces.
                  </p>
                </li>
                <li>
                  <p className="font-medium">Standards and Policies</p>
                  <p className="text-muted-foreground">
                    Guidelines ensuring consistency and interoperability of
                    geospatial data nationwide.
                  </p>
                </li>
                <li>
                  <p className="font-medium">Capacity Building</p>
                  <p className="text-muted-foreground">
                    Training and resources to support stakeholders in
                    effectively utilizing geospatial data and tools.
                  </p>
                </li>
              </ol>
            </section>

            <section id="impact">
              <h2 className="text-2xl font-semibold mb-4">
                Impact and Benefits
              </h2>
              <p className="mb-4">
                NGDI is already making significant contributions to
                Nigeria&apos;s development in multiple areas:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Supporting agricultural planning and food security initiatives
                  through detailed land use and soil mapping
                </li>
                <li>
                  Enhancing urban planning and infrastructure development with
                  accurate demographic and topographic data
                </li>
                <li>
                  Improving disaster preparedness and response through real-time
                  spatial information
                </li>
                <li>
                  Facilitating natural resource management and conservation
                  efforts with comprehensive environmental data
                </li>
                <li>
                  Enabling more effective public health interventions through
                  spatial analysis of health indicators
                </li>
              </ul>
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
