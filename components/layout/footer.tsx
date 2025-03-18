import Link from "next/link";
import { MapIcon } from "lucide-react"

const footerNavigation = {
  main: [
    { name: "Contact Us", href: "/contact" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-8 sm:py-12 lg:px-8">
        <div className="flex items-center justify-center space-x-2">
          <MapIcon className="h-6 w-6" />
          <span className="text-lg font-semibold">NGDI Portal</span>
        </div>
        <nav
          className="mt-6 flex justify-center space-x-12"
          aria-label="Footer"
        >
          {footerNavigation.main.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm leading-6 text-muted-foreground hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
          &copy; {new Date().getFullYear()} National Geospatial Data
          Infrastructure. All rights reserved.
        </p>
      </div>
    </footer>
  )
}