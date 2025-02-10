export default function CommitteePage() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-8">
            NGDI Committee
          </h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="lead">
              The NGDI Committee oversees the development and implementation of
              Nigeria&apos;s geospatial data infrastructure, ensuring alignment
              with national objectives and international standards.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              Committee Structure
            </h2>
            <p>
              The committee consists of representatives from key government
              agencies, academic institutions, and private sector organizations
              involved in geospatial data management.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Development of policies and guidelines for geospatial data
                management
              </li>
              <li>
                Coordination of geospatial activities across different sectors
              </li>
              <li>Promotion of standards and best practices</li>
              <li>Oversight of capacity building initiatives</li>
              <li>Monitoring and evaluation of NGDI implementation</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Working Groups</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Technical Standards Working Group</li>
              <li>Data Policy Working Group</li>
              <li>Capacity Building Working Group</li>
              <li>Infrastructure Working Group</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}