# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev           # Start dev server
npm run build         # Production build
npm run start         # Start production server

# Code Quality
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix ESLint errors
npm run format        # Format with Prettier
npm run type-check    # TypeScript type check

# Utilities
npm run seed:reports  # Seed report data
```

Pre-commit hooks (Husky + lint-staged) automatically lint and format staged files.

## Architecture

**Next.js App Router** with the `(dashboard)` route group wrapping all protected pages. The root `/` redirects to `/dashboard`. Unauthenticated users are redirected to `/login` by `middleware.ts`.

### Authentication

JWT-based auth stored in localStorage + cookies. `contexts/auth-context.tsx` manages global auth state. `lib/auth/token.ts` handles JWT decoding, expiry checks, and token storage. Auto-refresh runs 5 minutes before expiry. RBAC has 3 roles: `admin`, `editor`, `viewer`.

### API Layer

`lib/api/client.ts` is the central `ApiClient` class that handles:

- Automatic `Authorization` header injection
- Token refresh on 401 responses
- FormData uploads
- Custom `ApiError` class for typed error handling

Each domain has its own API module in `lib/api/` (e.g., `reports.api.ts`, `blogs.ts`, `orders.ts`).

### State Management

No Redux/Zustand. Uses React Context for global state (`AuthContext`, `ChartGeneratorContext`) and custom hooks per domain in `hooks/` for data fetching and local state (e.g., `use-reports.ts`, `use-blog.ts`, `use-orders.ts`).

### Component Structure

- `components/ui/` — ShadCN UI primitives (do not modify these)
- `components/layout/` — Sidebar and header (admin-layout.tsx is the main shell)
- `components/[feature]/` — Feature-specific components co-located by domain
- `lib/config/` — Feature-specific constants and validation config
- `lib/validation/` — Zod schemas
- `lib/types/` — TypeScript type definitions

### Navigation & RBAC

`lib/navigation.ts` defines all sidebar nav items with role permissions. Use `filterNavigationByRole()` to filter by role. Route protection is at two layers: middleware (server-side) and `ProtectedRoute` component (client-side).

### Rich Text Editing

TipTap v3 is used for reports, blogs, and press releases. The Table of Contents parser is in `lib/utils/toc-template-parser.ts`.

### Chart Generator

Client-side only POC in `app/(dashboard)/chart-generator/`. Chart config generation is in `lib/utils/chart-builder.ts`. Export to image uses `html-to-image` via `lib/utils/chart-export.ts`. State is managed in `contexts/chart-generator-context.tsx`.

## Environment Variables

Copy `.env.example` to `.env.local`. Key variables:

| Variable                            | Purpose                                                |
| ----------------------------------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_API_BASE_URL`          | Backend API URL (default: `http://localhost:8081/api`) |
| `NEXT_PUBLIC_USE_MOCK_DATA`         | Toggle mock data mode                                  |
| `NEXT_PUBLIC_PREVIEW_DOMAIN`        | Domain used for content preview links                  |
| `NEXT_PUBLIC_JWT_TOKEN_KEY`         | localStorage key for access token                      |
| `NEXT_PUBLIC_JWT_REFRESH_TOKEN_KEY` | localStorage key for refresh token                     |

## Code Style

- **Prettier**: 100-char line width, single quotes, 2-space indent, trailing commas (ES5), semicolons
- **Imports**: Use `@/` path alias for all absolute imports
- **Styling**: Tailwind CSS v4 — use `cn()` from `lib/utils.ts` for conditional class merging
- **Icons**: Lucide React only
- **Toasts**: Use `sonner` via the `toast` import
