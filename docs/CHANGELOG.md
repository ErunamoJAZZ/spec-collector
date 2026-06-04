# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
- Fixed dark mode toggle by configuring Tailwind v4 custom dark variant (`@variant dark`) and binding `@uiw/react-md-editor` color mode to the global theme state.
- Initial workspace setup with pnpm workspaces.
- Implemented backend API using Express.js with login and specs endpoints.
- Configured frontend React application with Vite, TailwindCSS, and markdown editors.
- Created Supabase database schema (`supabase/schema.sql`).
- Added multi-stage Dockerfile for deployment.
- Integrated security measures (`ignore-scripts=true`, `bcryptjs`).
