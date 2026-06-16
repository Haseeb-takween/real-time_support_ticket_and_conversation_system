# Support System Backend

REST API and real-time WebSocket server for the support ticket and conversation system. Built with Express, MongoDB, and Socket.IO.

## Features

- JWT authentication with HTTP-only cookies
- Role-based access (`user` and `admin`)
- Support ticket CRUD with categories, priorities, and statuses
- Real-time messaging on tickets via Socket.IO
- Admin tools: view all tickets, assign agents, update status, mark tickets as seen
- Database seed script with demo accounts

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express 5
- **Database:** MongoDB (Mongoose)
- **Real-time:** Socket.IO
- **Validation:** Zod
- **Language:** TypeScript

## Prerequisites

- Node.js 20 or later
- pnpm (recommended) or npm
- MongoDB instance (local or Atlas)

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
| `NODE_ENV` | `development`, `production`, or `test` |
| `PORT` | Server port (default: `3000`) |
| `CORS_ORIGIN` | Allowed frontend origin (default: `http://localhost:5173`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs — must match the frontend |
| `JWT_EXPIRES_IN` | Token lifetime (default: `7d`) |

3. Seed demo accounts:

```bash
pnpm seed
```

This creates two admin and two user accounts using the `SEED_*` variables in `.env`.

4. Start the development server:

```bash
pnpm dev
```

The API runs at `http://localhost:3000`.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run compiled production build |
| `pnpm typecheck` | Type-check without emitting |
| `pnpm seed` | Seed demo users into the database |

## API Routes

All routes are prefixed with `/api`.

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Log in and receive auth cookie |
| POST | `/auth/logout` | No | Clear auth cookie |
| GET | `/auth/me` | Yes | Get current user |
| GET | `/auth/admins` | Admin | List admin users (for assignment) |

### Tickets

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/tickets` | User | List own tickets |
| POST | `/tickets` | User | Create a ticket |
| GET | `/tickets/admin` | Admin | List all tickets (filter/sort via query params) |
| GET | `/tickets/:id` | Yes | Get ticket details |
| GET | `/tickets/:id/messages` | Yes | List messages on a ticket |
| POST | `/tickets/:id/messages` | Yes | Send a message |
| PATCH | `/tickets/:id/status` | Admin | Update ticket status |
| PATCH | `/tickets/:id/assign` | Admin | Assign ticket to an admin |
| PATCH | `/tickets/:id/seen` | Admin | Mark ticket as seen |

### Ticket fields

- **Categories:** Technical, Billing, Account, General
- **Priorities:** Low, Medium, High
- **Statuses:** Open, In Progress, Resolved, Closed

## Socket.IO Events

Clients authenticate via the `token` cookie or `auth.token` in the handshake.

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_ticket` | `ticketId` | Join a ticket room for live updates |
| `leave_ticket` | `ticketId` | Leave a ticket room |

### Server → Client

| Event | Description |
|-------|-------------|
| `ticket:created` | New ticket submitted (admins) |
| `message:new` | New message on a ticket |
| `ticket:status_updated` | Ticket status changed |
| `ticket:assigned` | Ticket assigned to an admin |

### Rooms

- `admins` — all connected admin users
- `user:{userId}` — per-user notifications
- `ticket:{ticketId}` — per-ticket conversation updates

## Project Structure

```
src/
├── config/         # Environment validation
├── controllers/    # Route handlers
├── lib/            # Database and Socket.IO setup
├── middleware/     # Auth, logging, error handling
├── models/         # Mongoose schemas
├── routes/         # Express routers
├── scripts/        # Seed script
├── app.ts          # Express app factory
└── server.ts       # Entry point
```

## Demo Accounts

After running `pnpm seed`, you can log in with the credentials defined in `.env`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin1@demo.com` | `demo1234` |
| Admin | `admin2@demo.com` | `demo1234` |
| User | `user1@demo.com` | `demo1234` |
| User | `user2@demo.com` | `demo1234` |

## Frontend

The frontend lives in `../frontend` and runs on port `5173`. Make sure `CORS_ORIGIN` matches the frontend URL.
