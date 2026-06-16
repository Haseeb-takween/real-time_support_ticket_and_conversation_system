# Support System Frontend

Next.js web app for the real-time support ticket and conversation system. Users submit tickets and chat with support; admins manage and respond to tickets in real time.

## Features

- User registration and login
- User dashboard: create tickets, view status, live chat on tickets
- Admin dashboard: view all tickets, filter/search, assign agents, update status
- Real-time updates via Socket.IO (new tickets, messages, status changes)
- Role-based route protection (users and admins are redirected to the correct area)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4
- **Real-time:** Socket.IO client
- **Auth:** JWT stored in HTTP-only cookies, verified in `proxy.ts`

## Prerequisites

- Node.js 20 or later
- pnpm (recommended) or npm
- Backend API running (see `../backend/README.md`)

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy the environment file and configure it:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `BACKEND_URL` | Backend URL for server-side API proxying (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL for client-side Socket.IO connections |
| `JWT_SECRET` | Must match the backend's `JWT_SECRET` — used by `proxy.ts` for route protection |

3. Start the backend first, then run the frontend:

```bash
pnpm dev
```

The app runs at `http://localhost:5173`.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server on port 5173 |
| `pnpm build` | Create production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | Run ESLint |

## Architecture

### API proxy

Browser requests go to `/api/*` on the Next.js server. The catch-all route at `src/app/api/[...path]/route.ts` forwards them to the backend, preserving cookies for authentication.

Server Components use `apiFetch` from `src/lib/api.ts`, which calls the backend directly via `BACKEND_URL`.

### Route protection

`src/proxy.ts` verifies the JWT cookie and enforces role-based access:

- `/dashboard/*` — users only (admins are redirected to `/admin`)
- `/admin/*` — admins only (users are redirected to `/dashboard`)

### Real-time

`src/lib/socket.ts` connects to the backend via Socket.IO using `NEXT_PUBLIC_BACKEND_URL`. Ticket pages join ticket rooms to receive live messages and status updates.

## Pages

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Sign in |
| `/register` | Public | Create an account |
| `/dashboard` | User | List own tickets |
| `/dashboard/tickets/new` | User | Create a ticket |
| `/dashboard/tickets/[id]` | User | Ticket detail and chat |
| `/admin` | Admin | All tickets with filters |
| `/admin/tickets/[id]` | Admin | Manage ticket and chat |

## Project Structure

```
src/
├── app/
│   ├── api/[...path]/   # Backend API proxy
│   ├── admin/           # Admin pages
│   ├── dashboard/       # User pages
│   ├── login/
│   └── register/
├── components/          # Shared UI components
├── context/             # Auth context provider
├── lib/                 # API client, Socket.IO, types
└── proxy.ts             # JWT route protection
```

## Demo Accounts

After seeding the backend (`pnpm seed` in `../backend`), use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin1@demo.com` | `demo1234` |
| User | `user1@demo.com` | `demo1234` |

## Backend

The API server lives in `../backend` and runs on port `3000` by default. Both projects must share the same `JWT_SECRET`.
