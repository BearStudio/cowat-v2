# Cowat

![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D24-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

<img src="src/features/auth/auth-image.png" alt="A cow driving a car" width="260" align="right" style="border-radius: 12px; margin-left: 24px;" />

> [!NOTE]
> Carpooling management platform for organizations — connecting drivers and passengers within a shared workspace.

Cowat is a full-stack TypeScript web application that lets organizations coordinate daily commutes. Drivers post their routes and available seats; passengers request bookings. Admins manage users, monitor activity, and configure notification channels all within a multi-tenant, role-based workspace.

---

## Features

### For users
- **Commute posting** Drivers create one-way or round-trip commutes with customizable stops, departure times, and available seats
- **Commute templates** Save recurring routes as templates to speed up daily commute creation
- **Booking requests** Passengers request a spot on a commute; drivers accept or decline
- **Location management** Save and reuse personal pickup/dropoff locations
- **Notification preferences** Choose how and when to receive updates (email, Slack)

### For managers
- **Organization management** Create and manage organizations, invite users by email
- **User management** View, create, update, and ban users within an organization
- **Stats dashboard** Monitor commute activity and usage over time
- **Slack integration** Configure org-level Slack channels for automated notifications

### Platform
- **Multi-tenancy** Full organization isolation with role-based access control (`admin`, `user`)
- **Internationalization** English and French supported throughout the UI and emails
- **OpenAPI** Auto-generated API documentation available in development

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) |
| UI | [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) |
| Data fetching | [TanStack Query](https://tanstack.com/query) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| State | [Zustand](https://zustand-demo.pmnd.rs/) |
| API | [oRPC](https://orpc.unnoq.com/) (TypeScript RPC with OpenAPI support) |
| ORM | [Prisma](https://www.prisma.io/) |
| Auth | [Better Auth](https://www.better-auth.com/) |
| Database | [PostgreSQL](https://www.postgresql.org/) |
| Storage | [MinIO](https://min.io/) (S3-compatible) |
| Emails | [React Email](https://react.email/) + [Resend](https://resend.com/) |
| Notifications | [Slack Bolt](https://slack.dev/bolt-js/) + [jsx-slack](https://github.com/yhatt/jsx-slack) |
| i18n | [i18next](https://www.i18next.com/) |
| Unit tests | [Vitest](https://vitest.dev/) |
| E2E tests | [Playwright](https://playwright.dev/) |
| Component dev | [Storybook](https://storybook.js.org/) |
| Runtime | [Node.js](https://nodejs.org) >= 22 |

---

## Requirements

- [Node.js](https://nodejs.org) >= 22
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) (runs PostgreSQL + MinIO locally)

---

## Getting started

### 1. Clone and install

```bash
git clone <repo-url>
cd cowat
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Key variables to review (defaults work out-of-the-box with Docker):

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Secret key for session signing **change in production** |
| `EMAIL_SERVER` | SMTP server (defaults to maildev for local dev) |
| `RESEND_API_KEY` | Resend API key (required in production) |
| `S3_*` | MinIO/S3 credentials for file uploads |

> [!NOTE]
> Do **not** change `EMAIL_SERVER` for local development the default points to the maildev container which catches all outgoing emails.

### 3. Start services and initialize the database

```bash
pnpm dk:init   # Start Docker (PostgreSQL + MinIO)
pnpm db:init   # Push schema + seed initial data
```

### 4. Run the development server

```bash
pnpm dev
```

The application is available at [http://localhost:3000](http://localhost:3000).

> [!NOTE]
> **No Docker?** Set up a PostgreSQL database manually and update `DATABASE_URL`, then run `pnpm db:push && pnpm db:seed`.

---

## IDE setup

**VS Code**
```bash
cp .vscode/settings.example.json .vscode/settings.json
```

**Zed**
```bash
cp .zed/settings.example.json .zed/settings.json
```

---

## Development reference

### Scripts

#### Development

| Command | Description |
|---|---|
| `pnpm dev` | Start the dev server (app + SMTP watcher) |
| `pnpm storybook` | Open Storybook component explorer at [localhost:6006](http://localhost:6006) |

#### Database

| Command | Description |
|---|---|
| `pnpm dk:init` | Initialize Docker services (first time) |
| `pnpm dk:start` | Start Docker services |
| `pnpm dk:stop` | Stop Docker services |
| `pnpm dk:clear` | Remove Docker volumes (destructive) |
| `pnpm db:init` | Push schema + seed data |
| `pnpm db:push` | Sync Prisma schema to the database |
| `pnpm db:seed` | Seed the database |
| `pnpm db:reset` | Full reset (destructive) |
| `pnpm db:ui` | Open Prisma Studio |

#### Code quality

| Command | Description |
|---|---|
| `pnpm lint` | Run all linters (oxlint + TypeScript) |
| `pnpm format` | Format code with oxfmt |

#### Code generation

| Command | Description |
|---|---|
| `pnpm gen:prisma` | Regenerate Prisma client |
| `pnpm gen:icons` | Generate icon components from SVG sources |
| `pnpm gen:build-info` | Generate build metadata |

---

### Email development

All emails are intercepted locally by [maildev](https://github.com/maildev/maildev).

- **Maildev UI**: [http://localhost:1080](http://localhost:1080)
- **Preview a template**: `http://localhost:3000/api/dev/email/{template}`
  - Example: [http://localhost:3000/api/dev/email/login-code](http://localhost:3000/api/dev/email/login-code)
- **Preview in a specific language**: append `?language=fr` (or `en`)
- **Pass props to a template**: append `?propName=value` as query parameters

Email templates are built with React Email and live in `src/emails/templates/`.

---

### API documentation

OpenAPI documentation is auto-generated from oRPC router definitions and accessible at:

```
http://localhost:3000/api/openapi/app
```

---

### Custom icons

Place SVG files in `src/components/icons/svg-sources/` and run:

```bash
pnpm gen:icons
```

> [!WARNING]
> SVG files must be named with the `icon-` prefix (e.g. `icon-external-link.svg`), be square, and use `#000` as the fill color (it will be replaced with `currentColor`).

---

### Environment indicator

Display a labeled banner in non-production environments by setting:

```env
VITE_ENV_NAME="staging"
VITE_ENV_EMOJI="🔬"
VITE_ENV_COLOR="teal"
```

---

## Testing

### Unit tests

```bash
pnpm test       # Run tests in headless mode
pnpm test:ui    # Open interactive test UI
```

### End-to-end tests

E2E tests use Playwright. A [summary of all test scenarios](e2e/specs/e2e.md) is available in the repository.

```bash
pnpm e2e        # Run all tests headlessly (CI mode)
pnpm e2e:setup  # Generate auth context (required once, and after DB changes)
pnpm e2e:ui     # Open Playwright UI to run and debug specific tests
```

> [!WARNING]
> The generated E2E context files contain authentication state. Re-run `pnpm e2e:setup` after any local database changes. This step runs automatically in CI.

---

## Production

```bash
pnpm install
pnpm build
pnpm start
```

Optionally build Storybook to expose it at `/storybook`:

```bash
pnpm storybook:build
pnpm build
pnpm start
```

---

## Project structure

```
src/
├── app/                  # Client-side app entry, providers, global styles
├── components/           # Shared UI components and icons
├── emails/               # React Email templates
├── features/             # Feature modules (auth, commute, booking, …)
│   ├── auth/
│   ├── booking/
│   ├── commute/
│   ├── commute-template/
│   ├── dashboard/
│   ├── location/
│   ├── notification/
│   ├── organization/
│   ├── slack/
│   ├── stats/
│   └── user/
├── locales/              # i18n translation files (en, fr)
├── routes/               # TanStack Router file-based routes
│   ├── app/              # User-facing routes (/app/$orgSlug/…)
│   └── manager/          # Manager routes (/manager/$orgSlug/…)
├── server/
│   ├── db/               # Prisma client + middleware (soft-delete)
│   └── routers/          # oRPC procedure definitions
└── utils/                # Shared utilities and helpers
```
