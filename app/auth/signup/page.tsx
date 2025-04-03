import { AuthForm } from "@/components/auth/auth-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up | NGDI Portal",
  description: "Create an account for NGDI Portal",
}

export default function SignUpPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Fill out the form below to create your account
          </p>
        </div>
        <AuthForm 
          mode="signup" 
          redirectPath="/dashboard" 
        />
      </div>
    </div>
  )
}
