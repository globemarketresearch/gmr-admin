# Healthcare Market Research Admin Panel

A modern, full-featured admin panel for managing market research reports, blog posts, and content. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features Implemented

### EPIC 0: Project Setup & Foundations

- Next.js 14 with TypeScript and App Router
- Environment variables configuration with type safety
- ESLint, Prettier, and Husky for code quality
- Tailwind CSS for styling
- ShadCN UI component library
- Admin layout with sidebar and header
- Light/Dark theme support with next-themes
- Reusable UI components

### EPIC 1: Authentication & RBAC

- Login page with form validation
- JWT token storage and refresh handling
- Protected route guards (client and server-side)
- Role-based menu visibility (Admin, Editor, Viewer)
- Session expiry handling with automatic token refresh
- Authentication context and custom hooks
- Next.js middleware for route protection

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** ShadCN UI
- **Icons:** Lucide React
- **Theme:** next-themes
- **Notifications:** Sonner
- **Code Quality:** ESLint, Prettier, Husky, lint-staged

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd healthcare-market-research-admin
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Copy `.env.example` to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── dashboard/        # Main dashboard page
│   │   └── layout.tsx        # Dashboard layout wrapper
│   ├── login/                # Login page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page (redirects to dashboard)
├── components/
│   ├── auth/                 # Authentication components
│   │   └── protected-route.tsx
│   ├── layout/               # Layout components
│   │   ├── admin-layout.tsx
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── user-nav.tsx
│   ├── providers/            # Context providers
│   │   └── theme-provider.tsx
│   ├── ui/                   # ShadCN UI components
│   └── theme-toggle.tsx      # Theme switcher
├── contexts/
│   └── auth-context.tsx      # Authentication context
├── lib/
│   ├── api/                  # API utilities
│   │   └── client.ts         # API client with auth
│   ├── auth/                 # Auth utilities
│   │   └── token.ts          # JWT token management
│   ├── config.ts             # Environment config
│   ├── navigation.ts         # Navigation items & RBAC
│   └── utils.ts              # Utility functions
└── middleware.ts             # Next.js middleware for route protection
```

## Authentication Flow

1. User submits credentials on `/login`
2. On successful login:
   - JWT tokens are stored in localStorage
   - User is redirected to `/dashboard`
   - Auth context updates with user info
3. Protected routes check authentication via:
   - Server-side: Next.js middleware
   - Client-side: ProtectedRoute component
4. Token refresh happens automatically:
   - Every 5 minutes (configurable)
   - When a token is about to expire
5. On logout:
   - Tokens are cleared
   - User is redirected to `/login`

## Role-Based Access Control

Three user roles are supported:

- **Admin:** Full access to all features
- **Editor:** Access to content management (reports, blogs, charts, media)
- **Viewer:** Read-only access to dashboard

The navigation menu automatically filters based on user role.

## Environment Variables

See `.env.example` for all available environment variables:

- **API Configuration:** Backend URL and timeout
- **Authentication:** Token keys and JWT secret
- **Session:** Timeout and refresh intervals
- **Features:** Feature flags for dark mode, analytics, etc.
- **Media:** Upload limits and allowed file types

## Next Steps (EPIC 2-14)

The following features are planned for future implementation:

- Dashboard with KPIs and analytics
- Reports management (CRUD, versioning, SEO)
- Blog management with workflow
- Charts & data visualization
- Media library with Cloudinary
- SEO management
- Pricing & access control
- Lead & inquiry management
- User management
- System configuration
- Performance optimizations
- Testing suite
- Deployment pipeline

See `TaskList.md` for the complete implementation plan.

## Contributing

This is an internal admin panel. Please follow the coding standards enforced by ESLint and Prettier. All commits are automatically linted via Husky pre-commit hooks.

## License

Proprietary - All rights reserved.
