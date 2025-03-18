import { Metadata } from "next"
import { DocumentationLayout } from "@/components/documentation/layout"
import { ClientTOC } from "@/components/documentation/client-toc"

export const metadata: Metadata = {
  title: "User Guide | NGDI Documentation",
  description:
    "Learn how to effectively use the NGDI platform and its features.",
}

export default function UserGuidePage() {
  return (
    <DocumentationLayout>
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 xl:grid xl:grid-cols-[1fr_220px] xl:gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            NGDI User Guide
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            This guide will help you navigate the NGDI platform and make the
            most of its features.
          </p>

          <div className="space-y-8">
            <section id="getting-started">
              <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
              <p className="mb-4">
                The NGDI platform gives you access to Nigeria&apos;s geospatial
                data through an intuitive interface. Whether you&apos;re a
                first-time user or returning visitor, this guide will help you
                navigate the platform effectively.
              </p>
              <p>
                To begin using the NGDI platform, simply visit our homepage and
                create an account or log in if you already have one. Basic
                access is available to all registered users, with additional
                features available to specific user groups.
              </p>
            </section>

            <section id="platform-interface">
              <h2 className="text-2xl font-semibold mb-4">
                Platform Interface
              </h2>
              <p className="mb-4">
                The NGDI platform consists of several key areas:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Data Catalog:</strong> Browse and search for available
                  geospatial datasets
                </li>
                <li>
                  <strong>Map Viewer:</strong> Visualize and interact with
                  geospatial data on an interactive map
                </li>
                <li>
                  <strong>Dashboard:</strong> Access your saved maps, recent
                  activities, and personalized content
                </li>
                <li>
                  <strong>Resources:</strong> Find guides, case studies, and
                  educational materials
                </li>
                <li>
                  <strong>Community:</strong> Connect with other users and
                  participate in discussions
                </li>
              </ul>
            </section>

            <section id="finding-data">
              <h2 className="text-2xl font-semibold mb-4">Finding Data</h2>
              <p className="mb-4">
                The NGDI platform hosts a wide range of geospatial datasets. To
                find the data you need:
              </p>
              <ol className="list-decimal pl-6 space-y-4">
                <li>
                  <p className="font-medium">Use the Search Function</p>
                  <p className="text-muted-foreground">
                    Enter keywords related to your area of interest in the
                    search bar at the top of the Data Catalog.
                  </p>
                </li>
                <li>
                  <p className="font-medium">Apply Filters</p>
                  <p className="text-muted-foreground">
                    Narrow your search using filters such as data category,
                    region, date, or data provider.
                  </p>
                </li>
                <li>
                  <p className="font-medium">Browse by Category</p>
                  <p className="text-muted-foreground">
                    Explore data organized by themes such as agriculture,
                    infrastructure, environment, or demographics.
                  </p>
                </li>
                <li>
                  <p className="font-medium">Check Featured Datasets</p>
                  <p className="text-muted-foreground">
                    View our curated collection of high-quality, frequently-used
                    datasets on the homepage.
                  </p>
                </li>
              </ol>
            </section>

            <section id="visualization">
              <h2 className="text-2xl font-semibold mb-4">Visualizing Data</h2>
              <p className="mb-4">
                Once you&apos;ve found a dataset you&apos;re interested in, you
                can visualize it in several ways:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>View on Map:</strong> Open the dataset in our
                  interactive map viewer to explore the data spatially
                </li>
                <li>
                  <strong>Add Multiple Layers:</strong> Combine different
                  datasets by adding multiple layers to your map
                </li>
                <li>
                  <strong>Adjust Styling:</strong> Change colors, transparency,
                  and other visual properties to customize your view
                </li>
                <li>
                  <strong>Create Thematic Maps:</strong> Generate maps based on
                  specific attributes in the data
                </li>
                <li>
                  <strong>Share Visualizations:</strong> Export your maps as
                  images or share them directly with others
                </li>
              </ul>
            </section>

            <section id="user-profile">
              <h2 className="text-2xl font-semibold mb-4">
                Managing Your User Profile
              </h2>
              <p className="mb-4">
                Your NGDI user profile helps personalize your experience and
                manage your activities on the platform:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Profile Information:</strong> Update your contact
                  details and organization affiliation
                </li>
                <li>
                  <strong>Saved Maps:</strong> Access maps you&apos;ve created
                  and saved
                </li>
                <li>
                  <strong>Notification Settings:</strong> Control which updates
                  you receive about new data or platform features
                </li>
                <li>
                  <strong>Usage History:</strong> Review your recent activities
                  and frequently used datasets
                </li>
                <li>
                  <strong>Data Contributions:</strong> Track any datasets
                  you&apos;ve contributed to the platform
                </li>
              </ul>
            </section>

            <section id="community-participation">
              <h2 className="text-2xl font-semibold mb-4">
                Community Participation
              </h2>
              <p className="mb-4">
                The NGDI platform is more than just a data repository—it&apos;s
                a community of users passionate about geospatial information.
                You can:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Join discussions about specific datasets or geospatial topics
                </li>
                <li>
                  Share insights and use cases from your work with NGDI data
                </li>
                <li>
                  Provide feedback on datasets to help improve data quality
                </li>
                <li>
                  Participate in virtual events, webinars, and training sessions
                </li>
                <li>Connect with other professionals in your field</li>
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
