import { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight, SearchIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "FAQ | National Geo-Spatial Data Infrastructure",
  description:
    "Frequently asked questions about the National Geo-Spatial Data Infrastructure (NGDI) Portal and geospatial data management in Nigeria.",
}

interface FAQItemProps {
  question: string
  answer: React.ReactNode
}

interface FAQSectionProps {
  title: string
  description?: string
  items: FAQItemProps[]
}

export default function FAQPage() {
  return (
    <div className="py-8 sm:py-12 bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto">
          <div className="space-y-2 mb-6">
            <Badge variant="outline" className="mb-2">
              Help Center
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about the NGDI Portal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="col-span-1 md:col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <SearchIcon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">
                    Search Our Documentation
                  </h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  If you can&apos;t find what you&apos;re looking for in our
                  FAQ, try exploring our detailed documentation for in-depth
                  guides and tutorials.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="/documentation"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                  >
                    Browse Documentation
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Contact Support
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-3">
                  {[
                    { name: "User Guide", href: "/documentation/user-guide" },
                    { name: "API Documentation", href: "/documentation/api" },
                    {
                      name: "Metadata Standards",
                      href: "/documentation/metadata-standards",
                    },
                    { name: "Terms of Service", href: "/terms" },
                    { name: "Privacy Policy", href: "/privacy" },
                  ].map((link) => (
                    <li key={link.name} className="flex items-center">
                      <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-10">
            <FAQSection
              title="General Information"
              description="Basic information about the NGDI Portal and its purpose"
              items={[
                {
                  question: "What is the NGDI Portal?",
                  answer: (
                    <p>
                      The National Geo-Spatial Data Infrastructure (NGDI) Portal
                      is a centralized platform for managing and accessing
                      geospatial data in Nigeria. It provides tools for user
                      authentication, metadata management, map visualization,
                      and search capabilities, enabling government agencies,
                      researchers, and other stakeholders to discover, access,
                      and utilize geospatial data effectively.
                    </p>
                  ),
                },
                {
                  question: "Who can use the NGDI Portal?",
                  answer: (
                    <p>
                      The NGDI Portal is designed for multiple user types
                      including:
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>
                          Government agencies responsible for geospatial data
                          management
                        </li>
                        <li>
                          Data providers who generate and share geospatial data
                        </li>
                        <li>
                          Researchers from academic and research institutions
                        </li>
                        <li>
                          Policy makers who need geospatial data for
                          decision-making
                        </li>
                        <li>
                          General public interested in accessing public
                          geospatial information
                        </li>
                        <li>System administrators who manage the portal</li>
                      </ul>
                    </p>
                  ),
                },
                {
                  question: "Is the NGDI Portal free to use?",
                  answer: (
                    <p>
                      The NGDI Portal offers both free and premium services:
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>
                          Basic access to public datasets is available to all
                          users at no cost
                        </li>
                        <li>
                          Some specialized datasets may require payment or
                          specific authorization
                        </li>
                        <li>
                          Premium features such as advanced analytics and
                          high-resolution data may be subject to fees
                        </li>
                        <li>
                          Government agencies and academic institutions may
                          qualify for special access arrangements
                        </li>
                      </ul>
                      For detailed information about pricing and access levels,
                      please contact the NGDI administration.
                    </p>
                  ),
                },
                {
                  question:
                    "What types of data are available on the NGDI Portal?",
                  answer: (
                    <div>
                      <p>
                        The NGDI Portal hosts a wide variety of geospatial
                        datasets including:
                      </p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>
                          Administrative boundaries (national, state, local
                          government)
                        </li>
                        <li>Topography and elevation data</li>
                        <li>Land use and land cover information</li>
                        <li>
                          Transportation networks (roads, railways, airports)
                        </li>
                        <li>
                          Satellite imagery and ortho-rectified image maps
                        </li>
                        <li>Hydrological data (rivers, lakes, watersheds)</li>
                        <li>Population demographics and distribution</li>
                        <li>Cadastral information and land registry</li>
                        <li>Infrastructure and utilities networks</li>
                        <li>Soil and geological data</li>
                        <li>Environmental and ecological zones</li>
                        <li>Climate and meteorological data</li>
                        <li>Natural resources and mineral deposits</li>
                      </ul>
                    </div>
                  ),
                },
              ]}
            />

            <FAQSection
              title="Account Management"
              description="Information about user accounts and access management"
              items={[
                {
                  question: "How do I create an account?",
                  answer: (
                    <p>
                      To create an account on the NGDI Portal:
                      <ol className="list-decimal pl-6 mt-2 space-y-1">
                        <li>
                          Click on the &quot;Register&quot; button in the top
                          right corner of the homepage
                        </li>
                        <li>
                          Fill out the registration form with your information
                        </li>
                        <li>
                          Verify your email address by clicking the link sent to
                          your inbox
                        </li>
                        <li>Complete your profile information</li>
                        <li>
                          Wait for account approval (if required for your user
                          type)
                        </li>
                      </ol>
                      Once approved, you'll have access to the portal features
                      based on your user role.
                    </p>
                  ),
                },
                {
                  question: "I forgot my password. How can I reset it?",
                  answer: (
                    <p>
                      To reset your password:
                      <ol className="list-decimal pl-6 mt-2 space-y-1">
                        <li>
                          Click on the &quot;Login&quot; button in the top right
                          corner
                        </li>
                        <li>
                          Select &quot;Forgot password?&quot; below the login
                          form
                        </li>
                        <li>
                          Enter the email address associated with your account
                        </li>
                        <li>
                          Check your email for password reset instructions
                        </li>
                        <li>Follow the link to create a new password</li>
                      </ol>
                      If you don&apos;t receive the email within a few minutes,
                      check your spam folder or contact support for assistance.
                    </p>
                  ),
                },
                {
                  question: "What are the different user roles?",
                  answer: (
                    <div>
                      <p>
                        The NGDI Portal has several user roles with different
                        permissions:
                      </p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>
                          <strong>Visitor:</strong> Can access public data and
                          basic portal features without registration
                        </li>
                        <li>
                          <strong>Registered User:</strong> Can access
                          additional datasets and save searches
                        </li>
                        <li>
                          <strong>Data Provider:</strong> Can upload and manage
                          their own geospatial datasets
                        </li>
                        <li>
                          <strong>Administrator:</strong> Has full access to
                          manage users, data, and system settings
                        </li>
                        <li>
                          <strong>Agency User:</strong> Special role for
                          government agency representatives with specific
                          permissions
                        </li>
                      </ul>
                      <p className="mt-2">
                        Each role has different capabilities within the system
                        based on their responsibilities and needs.
                      </p>
                    </div>
                  ),
                },
                {
                  question: "How can I change my user information?",
                  answer: (
                    <p>
                      You can update your user information by:
                      <ol className="list-decimal pl-6 mt-2 space-y-1">
                        <li>Logging into your account</li>
                        <li>
                          Clicking on your profile icon in the top right corner
                        </li>
                        <li>
                          Selecting "Profile" or "Settings" from the dropdown
                          menu
                        </li>
                        <li>
                          Updating your information in the relevant sections
                        </li>
                        <li>Saving your changes</li>
                      </ol>
                      Note that some information may require verification or
                      approval after changes are made.
                    </p>
                  ),
                },
              ]}
            />

            <FAQSection
              title="Metadata Management"
              description="Information about creating, editing, and managing metadata"
              items={[
                {
                  question: "What is metadata and why is it important?",
                  answer: (
                    <div>
                      <p>
                        Metadata is &quot;data about data&quot; - it provides
                        descriptive information about a dataset, including:
                      </p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>When and how the data was created</li>
                        <li>Who created and maintains the data</li>
                        <li>The geographic area covered</li>
                        <li>Data format and structure</li>
                        <li>Update frequency and history</li>
                        <li>Usage restrictions and licensing</li>
                      </ul>
                      <p className="mt-2">
                        Metadata is crucial because it helps users discover
                        relevant datasets, understand data quality and
                        limitations, and determine if the data is suitable for
                        their needs. Good metadata ensures that valuable
                        geospatial data can be found and used effectively.
                      </p>
                    </div>
                  ),
                },
                {
                  question: "How do I create metadata for my dataset?",
                  answer: (
                    <div>
                      <p>To create metadata for your dataset:</p>
                      <ol className="list-decimal pl-6 mt-2 space-y-1">
                        <li>
                          Log into your account with data provider permissions
                        </li>
                        <li>Navigate to "My Metadata" in the dashboard</li>
                        <li>Click "Create New Metadata" button</li>
                        <li>
                          Fill out the metadata form with comprehensive
                          information about your dataset
                        </li>
                        <li>Upload sample or preview files if available</li>
                        <li>Specify access and usage conditions</li>
                        <li>
                          Submit for review (if required) or publish directly
                        </li>
                      </ol>
                      <p className="mt-2">
                        The NGDI Portal follows standardized metadata formats to
                        ensure interoperability with other systems. For detailed
                        guidance, refer to the{" "}
                        <a
                          href="/documentation/metadata-standards"
                          className="text-primary hover:underline"
                        >
                          Metadata Standards Documentation
                        </a>
                        .
                      </p>
                    </div>
                  ),
                },
                {
                  question: "What metadata standards does the NGDI Portal use?",
                  answer: (
                    <div>
                      <p>
                        The NGDI Portal primarily uses the following metadata
                        standards:
                      </p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>
                          <strong>ISO 19115:</strong> Geographic Information
                          &ndash; Metadata standard
                        </li>
                        <li>
                          <strong>ISO 19139:</strong> XML schema implementation
                          of ISO 19115
                        </li>
                        <li>
                          <strong>FGDC CSDGM:</strong> Federal Geographic Data
                          Committee Content Standard for Digital Geospatial
                          Metadata
                        </li>
                        <li>
                          <strong>Dublin Core:</strong> For basic descriptive
                          elements
                        </li>
                      </ul>
                      <p className="mt-2">
                        These standards ensure that metadata created in the NGDI
                        Portal is compatible with international geospatial data
                        infrastructure initiatives and can be easily shared with
                        other systems.
                      </p>
                    </div>
                  ),
                },
                {
                  question: "How can I update my existing metadata records?",
                  answer: (
                    <p>
                      To update existing metadata records:
                      <ol className="list-decimal pl-6 mt-2 space-y-1">
                        <li>Log into your account</li>
                        <li>Navigate to "My Metadata" in the dashboard</li>
                        <li>Find the metadata record you wish to update</li>
                        <li>
                          Click the "Edit" button associated with that record
                        </li>
                        <li>Make the necessary changes to the metadata form</li>
                        <li>
                          Save your changes and submit for review if required
                        </li>
                      </ol>
                      The system maintains a version history of all metadata
                      changes, allowing you to track updates over time.
                    </p>
                  ),
                },
              ]}
            />

            <FAQSection
              title="Data Visualization and Access"
              description="Information about viewing, accessing, and using geospatial data"
              items={[
                {
                  question:
                    "How can I visualize geospatial data on the portal?",
                  answer: (
                    <div>
                      <p>
                        The NGDI Portal offers several ways to visualize
                        geospatial data:
                      </p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>
                          <strong>Interactive Maps:</strong> Browse and explore
                          data through the map interface
                        </li>
                        <li>
                          <strong>Layer Management:</strong> Add multiple data
                          layers to create custom map views
                        </li>
                        <li>
                          <strong>Thematic Maps:</strong> View data based on
                          specific themes or categories
                        </li>
                        <li>
                          <strong>Time Series Visualization:</strong> For
                          temporal data that changes over time
                        </li>
                        <li>
                          <strong>3D Visualization:</strong> For elevation and
                          terrain data (where available)
                        </li>
                      </ul>
                      <p className="mt-2">
                        To access these visualization tools, navigate to the
                        "Map" section of the portal or click on the "View Map"
                        option when viewing metadata records.
                      </p>
                    </div>
                  ),
                },
                {
                  question: "What formats can I download data in?",
                  answer: (
                    <div>
                      <p>
                        The NGDI Portal supports downloading data in various
                        formats depending on the data type:
                      </p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>
                          <strong>Vector data:</strong> Shapefile, GeoJSON, KML,
                          GML, FileGDB
                        </li>
                        <li>
                          <strong>Raster data:</strong> GeoTIFF, JPEG, PNG, ECW,
                          MrSID
                        </li>
                        <li>
                          <strong>Tabular data:</strong> CSV, Excel, JSON
                        </li>
                        <li>
                          <strong>Document data:</strong> PDF, DOC, HTML
                        </li>
                      </ul>
                      <p className="mt-2">
                        When downloading data, you can select your preferred
                        format from the available options on the dataset's
                        download page. Note that not all formats are available
                        for every dataset.
                      </p>
                    </div>
                  ),
                },
                {
                  question: "Are there restrictions on data use?",
                  answer: (
                    <div>
                      <p>
                        Yes, data usage restrictions vary by dataset and are
                        specified in each dataset's metadata. Common
                        restrictions include:
                      </p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>
                          <strong>Attribution requirements:</strong> Citing the
                          data source in your work
                        </li>
                        <li>
                          <strong>Commercial use limitations:</strong> Some
                          datasets may be restricted to non-commercial use
                        </li>
                        <li>
                          <strong>Redistribution constraints:</strong> Limits on
                          sharing or publishing the data
                        </li>
                        <li>
                          <strong>Sensitive data restrictions:</strong> Special
                          permissions required for sensitive information
                        </li>
                      </ul>
                      <p className="mt-2">
                        Always check the licensing information in the metadata
                        before using any dataset. For datasets with restricted
                        access, you may need to request permission or provide
                        information about your intended use.
                      </p>
                    </div>
                  ),
                },
                {
                  question: "Can I access NGDI data through APIs?",
                  answer: (
                    <div>
                      <p>
                        Yes, the NGDI Portal provides API access to its data
                        services:
                      </p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>
                          <strong>REST APIs:</strong> For programmatic access to
                          metadata and data
                        </li>
                        <li>
                          <strong>OGC Web Services:</strong> Including WMS, WFS,
                          WCS for map visualization and data access
                        </li>
                        <li>
                          <strong>GeoJSON APIs:</strong> For modern web
                          application development
                        </li>
                      </ul>
                      <p className="mt-2">
                        To use these APIs, you need to register for an API key
                        through your account settings. Detailed documentation
                        for all available APIs can be found in the{" "}
                        <a
                          href="/documentation/api"
                          className="text-primary hover:underline"
                        >
                          API Documentation
                        </a>{" "}
                        section.
                      </p>
                    </div>
                  ),
                },
              ]}
            />

            <FAQSection
              title="Technical Support"
              description="Help with technical issues and platform usage"
              items={[
                {
                  question: "Who do I contact for technical support?",
                  answer: (
                    <div>
                      <p>For technical support, you have several options:</p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>
                          <strong>Email Support:</strong> Contact
                          support@ngdi.gov.ng for technical assistance
                        </li>
                        <li>
                          <strong>Help Desk:</strong> Available during office
                          hours (8:00 AM - 4:00 PM, Monday-Friday)
                        </li>
                        <li>
                          <strong>Contact Form:</strong> Use the{" "}
                          <a
                            href="/contact"
                            className="text-primary hover:underline"
                          >
                            contact form
                          </a>{" "}
                          on our website
                        </li>
                        <li>
                          <strong>Knowledge Base:</strong> Check our{" "}
                          <a
                            href="/documentation"
                            className="text-primary hover:underline"
                          >
                            documentation
                          </a>{" "}
                          for guides and tutorials
                        </li>
                      </ul>
                      <p className="mt-2">
                        When reporting technical issues, please include as much
                        detail as possible, including your browser type,
                        operating system, and steps to reproduce the problem.
                      </p>
                    </div>
                  ),
                },
                {
                  question:
                    "What are the system requirements for using the NGDI Portal?",
                  answer: (
                    <div>
                      <p>
                        The NGDI Portal is designed to work with modern web
                        browsers and requires:
                      </p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>
                          <strong>Web Browser:</strong> Current versions of
                          Chrome, Firefox, Safari, or Edge
                        </li>
                        <li>
                          <strong>Internet Connection:</strong> Broadband
                          connection recommended, especially for map
                          visualization
                        </li>
                        <li>
                          <strong>Screen Resolution:</strong> Minimum 1024x768,
                          optimized for higher resolutions
                        </li>
                        <li>
                          <strong>JavaScript:</strong> Must be enabled for full
                          functionality
                        </li>
                        <li>
                          <strong>Cookies:</strong> Required for session
                          management and user preferences
                        </li>
                      </ul>
                      <p className="mt-2">
                        For advanced GIS functionality and 3D visualization, a
                        more powerful computer with a dedicated graphics card is
                        recommended.
                      </p>
                    </div>
                  ),
                },
                {
                  question: "How can I report bugs or suggest improvements?",
                  answer: (
                    <p>
                      We welcome your feedback to improve the NGDI Portal:
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>
                          <strong>Bug Reports:</strong> Report technical issues
                          to support@ngdi.gov.ng with "Bug Report" in the
                          subject line
                        </li>
                        <li>
                          <strong>Feature Suggestions:</strong> Send your ideas
                          to feedback@ngdi.gov.ng or use our feedback form
                        </li>
                        <li>
                          <strong>User Forums:</strong> Discuss with other users
                          in our community forums
                        </li>
                      </ul>
                      When reporting bugs, please include steps to reproduce the
                      issue, your browser and operating system information, and
                      screenshots if possible.
                    </p>
                  ),
                },
                {
                  question:
                    "Is there training available for using the NGDI Portal?",
                  answer: (
                    <div>
                      <p>Yes, we offer various training options:</p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>
                          <strong>Online Tutorials:</strong> Step-by-step guides
                          available in our documentation
                        </li>
                        <li>
                          <strong>Video Tutorials:</strong> Visual
                          demonstrations of key features
                        </li>
                        <li>
                          <strong>Webinars:</strong> Regular online training
                          sessions (check the calendar for upcoming events)
                        </li>
                        <li>
                          <strong>In-Person Workshops:</strong> Occasional
                          training events at various locations
                        </li>
                        <li>
                          <strong>Custom Training:</strong> For government
                          agencies and large organizations
                        </li>
                      </ul>
                      <p className="mt-2">
                        Most training resources are freely available through our{" "}
                        <a
                          href="/documentation"
                          className="text-primary hover:underline"
                        >
                          documentation portal
                        </a>
                        . For information about scheduled training events or to
                        request custom training, contact training@ngdi.gov.ng.
                      </p>
                    </div>
                  ),
                },
              ]}
            />
          </div>

          <div className="mt-16 border-t pt-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              If you couldn't find the answer to your question, our support team
              is here to help. Reach out to us and we'll get back to you as soon
              as possible.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function FAQSection({ title, description, items }: FAQSectionProps) {
  return (
    <div className="animate-in fade-in duration-700">
      <h2 className="text-3xl font-bold mb-2">{title}</h2>
      {description && (
        <p className="text-muted-foreground mb-6">{description}</p>
      )}
      <Accordion
        type="single"
        collapsible
        className="bg-card rounded-md border"
      >
        {items.map((item, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className={index === items.length - 1 ? "" : "border-b"}
          >
            <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/50">
              <span className="text-left font-medium">{item.question}</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 prose dark:prose-invert max-w-none">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
