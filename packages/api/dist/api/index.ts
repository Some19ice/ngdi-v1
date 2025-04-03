import { handle } from "hono/vercel"
import app from "../src"

// Export the handler function for Vercel serverless
export default handle(app)
