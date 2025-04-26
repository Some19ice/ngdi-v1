import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reset Password | NGDI Portal",
  description: "Reset your password for the NGDI Portal",
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      {children}
    </div>
  )
}
