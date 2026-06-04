# Agent Instructions

Welcome to the Spec Collector repository. Any AI or agent modifying this codebase MUST strictly adhere to the following rules to maintain consistency, security, and project standards.

## 1. Documentation & Tracking
- **CRITICAL**: Any AI modifying this repository MUST record the reason and details of the change in `docs/CHANGELOG.md` under the `## [Unreleased]` section.
- Always explain the *why* alongside the *what* when updating the changelog.

## 2. Monorepo Architecture
- The project uses **pnpm workspaces**.
- Backend code lives in `apps/api` (Node + Express).
- Frontend code lives in `apps/web` (React + Vite).
- Run commands globally using `pnpm -r` or target specific workspaces using `pnpm -F <workspace>`. Example: `pnpm -F web build`.
- Shared configuration (like `.env`, `oxlint`, `.npmrc`) lives at the project root. Do not duplicate these unnecessarilly inside the apps.

## 3. Security Mandates
- **pnpm configurations**: This project uses `ignore-scripts=true` in `.npmrc` to prevent supply chain attacks. Do NOT add dependencies that require postinstall compilation (e.g., native C++ bindings) unless absolutely necessary and explicitly authorized by the user. (This is why `bcryptjs` is used instead of `bcrypt`).
- **Deterministic Dependencies**: The `.npmrc` enforces `strict-peer-dependencies=true`. Ensure package versions align perfectly.

## 4. Frontend Conventions
- **Tailwind CSS v4**: We are using Tailwind v4. The dark mode is managed manually via a custom variant defined in `apps/web/src/index.css` (`@variant dark (&:where(.dark, .dark *));`). Do not rely on standard system media queries for toggling dark mode inside the app components.
- **Third-Party Components**: Components like `@uiw/react-md-editor` need explicit theme injection. Always pass the current theme from `useTheme()` to third-party elements (e.g., `data-color-mode={theme}`).
- **Data Fetching**: Use the configured Axios instance in `apps/web/src/lib/api.ts` which automatically attaches the JWT token.
- **Styling**: Always use CSS variables (defined in `index.css`) for background and foreground colors to ensure smooth dark/light mode transitions (e.g., `bg-[var(--background)]`).

## 5. Backend Conventions
- **Express Handlers**: Do not use `async` functions directly as Express route handlers without a `try/catch` block wrapping the entire execution, or ensure you manually call `next(error)` inside catch blocks, as Express 4.x does not auto-handle unhandled promise rejections.
- **Supabase**: Only the backend should communicate directly with Supabase via the root `.env` credentials to protect data integrity and centralize authentication logic.
