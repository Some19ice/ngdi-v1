// Import the dynamic configuration
import { dynamic } from "./page-config"
import { Suspense } from "react"
import CreateUserForm from "./components/CreateUserForm"

export default function CreateUserPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateUserForm />
    </Suspense>
  )
}
