# WeatherMind Web Application

React-based frontend for the WeatherMind platform.

---

## Overview

This is the web frontend of WeatherMind, built with:

- **React 19** — UI framework
- **Vite 7** — Build tool and dev server
- **TypeScript** — Type safety
- **TailwindCSS 4** — Utility-first styling
- **shadcn/ui** — Component library (Radix UI based)
- **React Router 7** — Client-side routing
- **BetterAuth** — Authentication client

---

## Project Structure

```
apps/web/
├── src/
│   ├── main.tsx              # Application entry point
│   ├── App.tsx               # Router configuration
│   ├── index.css             # Global styles (Tailwind)
│   │
│   ├── pages/                # Route components
│   │   ├── LoginPage.tsx     # Authentication page
│   │   ├── SignupPage.tsx    # Registration page
│   │   ├── ForgotPassword.tsx
│   │   └── DashboardPage.tsx # Main application view
│   │
│   ├── components/           # Reusable UI components
│   │   ├── Navbar.tsx        # Navigation header
│   │   └── ui/               # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── card.tsx
│   │       └── sonner.tsx    # Toast notifications
│   │
│   ├── lib/                  # Utilities
│   │   ├── auth-client.ts    # BetterAuth client instance
│   │   └── utils.ts          # Helper functions (cn)
│   │
│   └── assets/               # Static assets
│       └── react.svg
│
├── public/                   # Public static files
├── nginx.conf                # Production Nginx configuration
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── components.json           # shadcn/ui configuration
├── Dockerfile.dev            # Development container
├── Dockerfile.prod           # Production container (multi-stage)
└── package.json
```

---

## Development

### Prerequisites

- Node.js 22.x
- pnpm 10.x

### Running Locally

**Option 1: With Docker (Recommended)**

```bash
# From monorepo root
pnpm dev:up

# Web available at http://localhost:5173
```

**Option 2: Standalone**

```bash
# From monorepo root
pnpm --filter web dev

# Or from this directory
cd apps/web
pnpm dev
```

### Environment Variables

The web app uses Vite's proxy in development to forward API requests:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://backend:5001',
    '/agent': 'http://agent-service:5002',
  },
}
```

No additional environment variables needed for development.

---

## Routes

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/` | DashboardPage | Yes |
| `/login` | LoginPage | No |
| `/signup` | SignupPage | No |
| `/forgot-password` | ForgotPassword | No |

---

## Authentication

Authentication is handled via BetterAuth client:

```typescript
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "/api/auth",
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

### Usage in Components

```typescript
import { useSession, signIn, signOut } from "@/lib/auth-client";

function MyComponent() {
  const { data: session, isPending } = useSession();

  if (isPending) return <Loading />;
  if (!session) return <LoginPrompt />;

  return <Dashboard user={session.user} />;
}
```

---

## Styling

### Tailwind CSS

Utility classes are used throughout:

```tsx
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
  Click me
</button>
```

### shadcn/ui Components

Pre-built accessible components from shadcn/ui:

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>Login</CardHeader>
  <CardContent>
    <Input type="email" placeholder="Email" />
    <Button>Submit</Button>
  </CardContent>
</Card>
```

### Adding New Components

```bash
# From apps/web directory
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

---

## Building for Production

### Local Build

```bash
pnpm --filter web build

# Output in apps/web/dist/
```

### Docker Build

```bash
# From monorepo root
docker build -t web:local -f apps/web/Dockerfile.prod .
```

The production image uses:
1. Node.js to build the React app
2. Nginx to serve static files

---

## Production Configuration

### Nginx Configuration

The `nginx.conf` handles:

- Static file serving from `/usr/share/nginx/html`
- SPA routing (fallback to `index.html`)
- Gzip compression
- Cache headers for assets

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location /assets {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### API Proxy in Production

In production, API requests are proxied at the Ingress level:

```
/api/*  →  backend service
/*      →  web service (this app)
```

---

## TypeScript Configuration

### Path Aliases

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Usage:
```typescript
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
```

### Strict Mode

TypeScript strict mode is enabled. Fix all type errors before committing.

---

## ESLint Configuration

Uses ESLint 9 with flat config:

```bash
# Run linting
pnpm --filter web lint

# Auto-fix issues
pnpm --filter web lint --fix
```

Configured rules:
- `@eslint/js` recommended rules
- `typescript-eslint` strict rules
- `eslint-plugin-react-hooks` for React hooks
- `eslint-plugin-react-refresh` for Fast Refresh

---

## Common Tasks

### Add a New Page

1. Create component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`:
   ```tsx
   <Route path="/new-page" element={<NewPage />} />
   ```

### Add a New UI Component

```bash
# Use shadcn CLI
npx shadcn@latest add [component-name]

# Or create manually in src/components/
```

### Update Tailwind Theme

Edit `tailwind.config.js` or use CSS variables in `src/index.css`.

---

## Troubleshooting

### Hot Reload Not Working

```bash
# Restart Vite dev server
pnpm --filter web dev

# Or restart Docker container
pnpm dev:restart
```

### TypeScript Errors in IDE

```
VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Build Failures

```bash
# Clear Vite cache
rm -rf apps/web/node_modules/.vite

# Reinstall dependencies
pnpm install
```
