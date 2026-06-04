# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
- Integrated theme toggle into header:
  - Moved `ThemeToggle` from App.tsx into the `SpecsPage` header to prevent overlap with the options menu on mobile.
  - Added theme toggle to `LoginPage` so users can switch themes before logging in.
  - Added responsive sizing for the theme toggle button.
- Restored session timer in SpecsPage header (visible on sm+ screens).
- Added GitHub link to header:
  - Added a GitHub icon button in the `SpecsPage` header that links to the repository.
  - Styled with hover states that respect dark/light mode for a consistent user experience.
- Made UI responsive for mobile devices:
  - Reduced header padding and font sizes on small screens.
  - Adjusted spacing and layout for better mobile experience.
  - Adjusted MDEditor heights for smaller screens.
  - Made modal buttons stack vertically on mobile.
- Implemented PIN change functionality:
  - Added `PUT /api/auth/change-pin` backend route to securely validate the old PIN and update to the new PIN.
  - Added `ChangePinPage` to provide a user interface for changing the PIN.
  - Added an options dropdown menu in the `SpecsPage` header to easily access the Change PIN and Logout actions.
- Added unsaved changes protection:
  - Created a reusable `Modal` component.
  - Implemented logic in `SpecsPage` to warn users with a custom modal if they try to logout or change their PIN without saving.
  - Added a `beforeunload` event listener to warn users if they try to close the tab or leave the page with unsaved changes, preventing accidental data loss.
- Configured project for Vercel deployment:
  - Added `vercel.json` to route `/api/*` requests to Vercel Serverless Functions and other requests to the Vite frontend.
  - Created an `api/index.js` entrypoint for Serverless Functions.
  - Updated `apps/api/src/app.ts` to remove the static frontend serving (now handled by Vercel) and adjusted health check to `/api/health`.
  - Added a `vercel-build` script to the root `package.json`.
  - Changed the frontend API base URL in `apps/web/src/lib/api.ts` to `/api` to correctly use Vercel routing instead of hardcoding `localhost`.
- Created `.env.example` to provide a template for environment variables and ensured it is tracked by Git.
- Rewrote `README.md` to include detailed architecture, tech stack, and setup instructions.
- Rewrote `AGENTS.md` to specify detailed guidelines regarding the monorepo architecture, pnpm security choices, and frontend/backend conventions for AI agents.
- Fixed dark mode toggle by configuring Tailwind v4 custom dark variant (`@variant dark`) and binding `@uiw/react-md-editor` color mode to the global theme state.
- Initial workspace setup with pnpm workspaces.
- Implemented backend API using Express.js with login and specs endpoints.
- Configured frontend React application with Vite, TailwindCSS, and markdown editors.
- Created Supabase database schema (`supabase/schema.sql`).
- Added multi-stage Dockerfile for deployment.
- Integrated security measures (`ignore-scripts=true`, `bcryptjs`).
