# Nexus Classroom

A unified classroom, calendar, and live-meeting workspace for teachers and students — Google Classroom + Canvas + Google Calendar + Google Meet, in one app.

Built with Next.js (App Router) + TypeScript, Prisma/Postgres, Auth.js, and LiveKit for video.

## Design system

Every surface is built from the neumorphic primitives in [`src/components/ui`](src/components/ui) — `Surface`/`NeumorphicCard`, `NeumorphicButton`, `NeumorphicInput`, `NeumorphicToggle`. See them all in isolation at **`/design-system`**.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start Postgres

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` (credentials in [`docker-compose.yml`](docker-compose.yml), already wired into `.env`).

### 3. Configure environment

```bash
cp .env.example .env
```

`.env` ships with a working local Postgres URL and a generated `AUTH_SECRET`. Two things need real values before those features work:

- **`LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET`** — create a free project at [cloud.livekit.io](https://cloud.livekit.io) to enable the Meetings module. Without these, everything else works normally; visiting a meeting room shows a "not configured" message instead of connecting.
- **`STORAGE_DRIVER`** — `local` (default) writes uploads to `./storage/uploads`. Set to `s3` and fill in the `S3_*` vars to use S3-compatible storage instead.

### 4. Run migrations and seed demo data

```bash
npm run db:migrate
npm run db:seed
```

The seed script creates a teacher, three students, two classes (with assignments, a graded submission, and a recurring weekly class schedule), so the app is immediately explorable.

**Demo accounts** (password: `password123` for all):

| Role    | Email               |
| ------- | ------------------- |
| Teacher | teacher@nexus.edu   |
| Student | jordan@nexus.edu    |
| Student | priya@nexus.edu     |
| Student | sam@nexus.edu       |

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Other scripts

```bash
npm run db:studio   # browse the database visually
npm run db:down     # stop the Postgres container
npm run lint
```

## Architecture notes

- **File storage** is behind a `FileStorage` interface ([`src/lib/storage`](src/lib/storage)) with local-disk and S3-compatible implementations — swap via `STORAGE_DRIVER`.
- **Auth** uses Auth.js with a Credentials provider on JWT sessions; the Prisma adapter is already wired up so an OAuth/SSO provider can be added later without a schema change.
- **Calendar ↔ Meetings ↔ Classwork** are integrated by query, not by duplicated data: class events auto-appear on every enrolled student's calendar, assignment due dates are derived read-only calendar entries, and any virtual calendar event gets a LiveKit room lazily created on first join.
- **Live camera annotation** during meetings syncs via LiveKit's data channel (topic `annotation`) — no separate signaling path.
