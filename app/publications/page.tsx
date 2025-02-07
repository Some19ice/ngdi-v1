export default function PublicationsPage() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-8">
            Publications
          </h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="lead">
              Access official publications, reports, and documentation related to Nigeria's geospatial data infrastructure.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Technical Documents</h2>
            <ul className="list-disc pl-6 space-y-4">
              <li>
                <strong>NGDI Standards and Guidelines (2024)</strong>
                <p className="mt-2">Comprehensive documentation of technical standards and implementation guidelines for NGDI.</p>
              </li>
              <li>
                <strong>Metadata Management Protocol</strong>
                <p className="mt-2">Guidelines for creating and maintaining standardized metadata across the NGDI platform.</p>
              </li>
              <li>
                <strong>Data Quality Framework</strong>
                <p className="mt-2">Standards and procedures for ensuring data quality and consistency.</p>
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Reports</h2>
            <ul className="list-disc pl-6 space-y-4">
              <li>
                <strong>Annual Progress Report 2023</strong>
                <p className="mt-2">Overview of NGDI achievements, challenges, and future directions.</p>
              </li>
              <li>
                <strong>Quarterly Bulletins</strong>
                <p className="mt-2">Regular updates on NGDI activities and developments.</p>
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Research Papers</h2>
            <ul className="list-disc pl-6 space-y-4">
              <li>
                <strong>Geospatial Data Management in Nigeria: Challenges and Opportunities</strong>
                <p className="mt-2">Research paper on the current state of geospatial data management in Nigeria.</p>
              </li>
              <li>
                <strong>Implementation of SDI in Developing Nations</strong>
                <p className="mt-2">Comparative study of SDI implementation in developing countries.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}