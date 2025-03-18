import Link from "next/link";
import {
  MapIcon,
  Github,
  Mail,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

const footerNavigation = {
  main: [
    { name: "Home", href: "/" },
    { name: "Explore", href: "/search" },
    { name: "Contact Us", href: "/contact" },
    { name: "About", href: "/about" },
  ],
  legal: [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
  resources: [
    { name: "Documentation", href: "/docs" },
    { name: "FAQ", href: "/faq" },
    { name: "Help Center", href: "/help" },
  ],
}

const socialLinks = [
  { name: "Github", href: "https://github.com", icon: Github },
  { name: "Twitter", href: "https://twitter.com", icon: Twitter },
  { name: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { name: "Facebook", href: "https://facebook.com", icon: Facebook },
  { name: "Instagram", href: "https://instagram.com", icon: Instagram },
  { name: "Email", href: "mailto:contact@ngdi.org", icon: Mail },
]

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <MapIcon className="h-6 w-6" />
              <span className="text-lg font-semibold">NGDI Portal</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              National Geospatial Data Infrastructure - Empowering geospatial
              innovation through open data and collaborative solutions.
            </p>
            <div className="flex items-center space-x-4 mt-4">
              {socialLinks.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={item.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Navigation</h3>
            <ul className="space-y-3">
              {footerNavigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="space-y-3">
              {footerNavigation.resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="space-y-3">
              {footerNavigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground mb-2 sm:mb-0">
            &copy; {new Date().getFullYear()} National Geospatial Data
            Infrastructure. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="hidden sm:inline">Designed and built with </span>
            <span className="inline-block ml-1 text-red-500">❤</span>
          </p>
        </div>
      </div>
    </footer>
  )
}