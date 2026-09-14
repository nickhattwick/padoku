# Padoku

Padoku is a racing-themed productivity app for tracking work items, projects, teams, calendar-style events, and time logs. The repo is a pnpm workspace with a React/Vite frontend, an Express API, shared TypeScript types, and an optional MCP server.

## Apps

- `apps/web` - React frontend served by Vite.
- `apps/server` - Express API backed by a local sql.js SQLite database file.
- `apps/mcp-server` - Optional MCP integration for agent access.
- `packages/shared` - Shared TypeScript types and utilities.

## Prerequisites

- Node.js 20 or newer
- pnpm
- A Google OAuth client ID if you want Google login locally

If pnpm is not installed, enable it with Corepack:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

## Install

```bash
pnpm install
```

## Environment

Create a server env file:

```bash
cp apps/server/.env.example apps/server/.env
```

At minimum, set a real JWT secret:

```env
JWT_SECRET=replace-with-a-long-random-string
```

For Google login, create OAuth credentials in Google Cloud Console and set:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Auth controls are optional and comma-separated:

```env
PADOKU_ALLOWED_EMAILS=
PADOKU_ADMIN_EMAILS=admin@example.com
PADOKU_MIGRATION_EMAILS=
PADOKU_DEV_USER_EMAIL=admin@example.com
```

- Leave `PADOKU_ALLOWED_EMAILS` empty to allow any valid Google login.
- Set `PADOKU_ADMIN_EMAILS` for admin-only routes.
- Set `PADOKU_MIGRATION_EMAILS` only when importing legacy unassigned work items.
- Set `PADOKU_DEV_USER_EMAIL` only if using the local development token route.

The server database path defaults to:

```env
DB_PATH=./data/paddock.db
```

That database is local runtime state and is intentionally ignored by Git.

The web app can usually run without its own env file in development because Vite proxies `/api` to `http://localhost:3000`. For a direct API URL, create:

```bash
cp apps/web/.env.example apps/web/.env
```

## Run Locally

Start the API and web app together:

```bash
pnpm dev
```

Default local URLs:

- Web: `http://localhost:5173`
- API: `http://localhost:3000/api`

Run one app at a time:

```bash
pnpm dev:web
pnpm dev:server
```

## Build

```bash
pnpm build
```

Build only the server:

```bash
pnpm --filter server build
```

Build only the web app:

```bash
pnpm --filter web build
```

## Test

```bash
pnpm test
```

## Data And Secrets

Do not commit runtime data or credentials. The repo ignores common local artifacts including:

- `.env` and `.env.*`
- `*.db`, `*.sqlite`, `*.sqlite3`, `*.db-shm`, `*.db-wal`
- `data/`
- private keys and credential files
- mobile credential files such as `google-services.json` and `GoogleService-Info.plist`

Use `.env.example` files as templates and keep real values local.
