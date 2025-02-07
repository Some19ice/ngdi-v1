export default function PrivacyPage() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-8">
            Privacy Policy
          </h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="lead">
              This Privacy Policy describes how your personal information is collected, used, and shared when you use the NGDI Portal.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information</li>
              <li>Usage data</li>
              <li>Technical information</li>
              <li>Communication data</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain the NGDI Portal</li>
              <li>To improve our services</li>
              <li>To communicate with you</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}