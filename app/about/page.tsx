export default function AboutPage() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-8">
            About NGDI
          </h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="lead">
              The Nigeria Geospatial Data Infrastructure (NGDI) is a national initiative aimed at creating a robust framework for geospatial data management and sharing across Nigeria.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
            <p>
              To establish and maintain a standardized national geospatial data infrastructure that facilitates the discovery, access, and use of geospatial data across Nigeria, promoting informed decision-making and sustainable development.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Our Vision</h2>
            <p>
              To be the authoritative source for geospatial data in Nigeria, enabling seamless collaboration between government agencies, researchers, and the private sector.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Key Objectives</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Establish standards for geospatial data collection and management</li>
              <li>Facilitate data sharing between government agencies and stakeholders</li>
              <li>Promote the use of geospatial data in decision-making</li>
              <li>Build capacity in geospatial technology across Nigeria</li>
              <li>Support sustainable development through better spatial planning</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}