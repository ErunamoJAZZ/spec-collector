# Spec Collector

Spec Collector is a full-stack web application designed to help users securely log in via a PIN and manage project specifications and execution plans.

## Architecture

This project is structured as a monorepo using **pnpm workspaces**:
- `apps/api`: Backend service built with Node.js and Express.
- `apps/web`: Frontend single-page application built with React, Vite, and Tailwind CSS.
- `supabase`: Database schema definitions.

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router, `@uiw/react-md-editor`, Zod.
- **Backend**: Express, JWT authentication, `bcryptjs` for hashing.
- **Database**: Supabase (PostgreSQL).
- **Tooling**: pnpm, oxlint, vitest, Docker.

## Prerequisites
- Node.js (v18 or higher recommended)
- `pnpm` (Package manager)
- A [Supabase](https://supabase.com/) account and project.

## Setup Instructions

### 1. Database Configuration
In your Supabase project dashboard, go to the SQL Editor and execute the contents of the `supabase/schema.sql` file to create the necessary tables, functions, and triggers.

### 2. Environment Variables
Ensure you have a `.env` file at the root of the project with your Supabase credentials and an optional JWT secret:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-secure-jwt-secret # defaults to 'fallback-secret-for-dev' if omitted
```

### 3. Install Dependencies
Run the following command at the root of the project. Note that `ignore-scripts=true` is enabled for security reasons.

```bash
pnpm install
```

### 4. Running the Development Server
To start both the frontend and backend simultaneously in development mode:

```bash
pnpm run dev
```
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

### 5. Production Build
To build both applications and serve the frontend via the Express backend:

```bash
pnpm run build
pnpm start
```
The unified application will be available at `http://localhost:3001`.
