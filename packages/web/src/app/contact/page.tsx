export default function ContactPage() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-8">
            Contact Us
          </h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="lead">
              Get in touch with the NGDI team for support, inquiries, or collaboration opportunities.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Contact Information</h2>
            <ul className="list-none pl-0 space-y-4">
              <li>
                <strong>Address:</strong>
                <p className="mt-2">
                  NGDI Secretariat<br />
                  Federal Ministry of Science and Technology<br />
                  Abuja, Nigeria
                </p>
              </li>
              <li>
                <strong>Email:</strong>
                <p className="mt-2">contact@ngdi.gov.ng</p>
              </li>
              <li>
                <strong>Phone:</strong>
                <p className="mt-2">+234 (0) XXX XXX XXXX</p>
              </li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Office Hours</h2>
            <p>
              Monday - Friday: 8:00 AM - 4:00 PM<br />
              Saturday - Sunday: Closed
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Technical Support</h2>
            <p>
              For technical assistance with the NGDI Portal, please email:<br />
              support@ngdi.gov.ng
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}