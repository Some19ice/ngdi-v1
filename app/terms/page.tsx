export default function TermsPage() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-8">
            Terms of Service
          </h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="lead">
              Please read these terms of service carefully before using the NGDI Portal.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the NGDI Portal, you accept and agree to be bound by the terms and provisions of this agreement.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily access the materials on NGDI's website for personal, non-commercial transitory viewing only.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">3. Data Usage</h2>
            <p>
              All data accessed through the NGDI Portal must be used in accordance with the specified licenses and attribution requirements.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">4. User Obligations</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintain accurate registration information</li>
              <li>Protect account credentials</li>
              <li>Comply with data usage guidelines</li>
              <li>Respect intellectual property rights</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}