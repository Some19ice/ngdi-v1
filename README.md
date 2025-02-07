
Based on my review, here's a comprehensive overview of the project:

**Project Type and Framework:**
- This is a Next.js 13.5.1 project using TypeScript
- It's built with modern React (18.2.0) and includes TypeScript configuration
- Uses Tailwind CSS for styling with additional animations and utilities

**Key Features and Architecture:**
1. **Routing Structure:**
   - Uses Next.js App Router (indicated by the `app` directory)
   - Has several main routes including:
     - About
     - Committee
     - Contact
     - Publications
     - Privacy
     - Terms
     - Metadata

2. **UI Components:**
   - Extensive use of Radix UI components for accessible, unstyled components
   - Custom components organized in:
     - `components/layout/` for layout-related components
     - `components/ui/` for reusable UI components
   - Includes theme support with dark/light mode toggle

3. **Dependencies and Tools:**
   - Rich set of UI libraries:
     - Radix UI for accessible components
     - `date-fns` for date manipulation
     - `react-hook-form` for form handling
     - `zod` for schema validation
     - `recharts` for charting
     - `embla-carousel-react` for carousels
     - `sonner` for toast notifications
   - Development tools:
     - ESLint for code linting
     - PostCSS and Autoprefixer
     - Tailwind CSS with animations

4. **Development Setup:**
   - Standard Next.js scripts:
     - `dev` for development
     - `build` for production builds
     - `start` for running production server
     - `lint` for linting

**Project Structure:**
```
├── .next/               # Next.js build output
├── app/                 # Main application routes and pages
├── components/          # Reusable React components
│   ├── layout/         # Layout components
│   └── ui/             # UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and shared code
├── public/             # Static assets
└── various config files # (next.config.js, tailwind.config.ts, etc.)
```

**Notable Technical Choices:**
1. Modern stack with TypeScript and Next.js
2. Strong focus on UI/UX with comprehensive component libraries
3. Built-in theme support
4. Emphasis on accessibility through Radix UI
5. Well-structured routing using Next.js 13's app directory


