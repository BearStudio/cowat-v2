# Cowat

A full-stack TypeScript web application built with TanStack Start, Prisma, oRPC, Better Auth, and shadcn/ui.

## Technologies

[Node.js](https://nodejs.org), [TypeScript](https://www.typescriptlang.org/), [React](https://react.dev/), [TanStack Start](https://tanstack.com/start), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [React Hook Form](https://react-hook-form.com/), [oRPC](https://orpc.unnoq.com/), [Prisma](https://www.prisma.io/), [Better Auth](https://www.better-auth.com/), [Storybook](https://storybook.js.org/), [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/)

## Requirements

* [Node.js](https://nodejs.org) >= 22
* [pnpm](https://pnpm.io/)
* [Docker](https://www.docker.com/) (or a [PostgreSQL](https://www.postgresql.org/) database)

## Setup your IDE

- VS Code
```bash
cp .vscode/settings.example.json .vscode/settings.json
```

- Zed
```bash
cp .zed/settings.example.json .zed/settings.json
```

## Installation

```bash
cp .env.example .env # Setup your env variables
pnpm install # Install dependencies
pnpm dk:init # Init docker
pnpm db:init # Init the db
```

> [!NOTE]
> **Quick advices for local development**
> - **DON'T update** the **EMAIL_SERVER** variable, because the default value will be used to catch the emails during the development.

## Run

```bash
pnpm dk:start # Only if your docker is not running
pnpm dev
```

> [!NOTE]
> **Don't want to use docker?**
>
> Setup a PostgreSQL database (locally or online) and replace the **DATABASE_URL** environment variable. Then you can run `pnpm db:push` to update your database schema and then run `pnpm db:seed` to seed your database.

### Emails in development

#### Maildev to catch emails

In development, the emails will not be sent and will be catched by [maildev](https://github.com/maildev/maildev).

The maildev UI is available at [0.0.0.0:1080](http://0.0.0.0:1080).

#### Preview emails

Emails templates are built with `react-email` components in the `src/emails` folder.

You can preview an email template at `http://localhost:3000/api/dev/email/{template}` where `{template}` is the name of the template file in the `src/emails/templates` folder.

Example: [Login Code](http://localhost:3000/api/dev/email/login-code)

##### Email translation preview

Add the language in the preview url like `http://localhost:3000/api/dev/email/{template}?language={language}` where `{language}` is the language key (`en`, `fr`, ...)

#### Email props preview

You can add search params to the preview url to pass as props to the template.
`http://localhost:3000/api/dev/email/{template}/?{propsName}={propsValue}`

### OpenAPI Documentation for the API

You can access the API documentation via the OpenAPI interface at:

`http://localhost:3000/api/openapi/app`

### Generate custom icons components from svg files

Put the custom svg files into the `src/components/icons/svg-sources` folder and then run the following command:

```bash
pnpm gen:icons
```

> [!WARNING]
> All svg icons should be svg files prefixed by `icon-` (example: `icon-externel-link`) with **square size** and **filled with `#000` color** (will be replaced by `currentColor`).

### E2E Tests

E2E tests are setup with Playwright.

[E2E Test Scenarios](e2e/specs/e2e.md) — A summary of all scenarios covered by E2E tests.

```sh
pnpm e2e        # Run tests in headless mode, this is the command executed in CI
pnpm e2e:setup  # Setup context to be used across test for more efficient execution
pnpm e2e:ui     # Open a UI which allow you to run specific tests and see test execution
```

> [!WARNING]
> The generated e2e context files contain authentication logic. If you make changes to your local database instance, you should re-run `pnpm e2e:setup`. It will be run automatically in a CI context.

## Production

```bash
pnpm install
pnpm storybook:build # Optional: Will expose the Storybook at `/storybook`
pnpm build
pnpm start
```

## Show hint on development environments

Setup the `VITE_ENV_NAME` env variable with the name of the environment.

```
VITE_ENV_NAME="staging"
VITE_ENV_EMOJI="🔬"
VITE_ENV_COLOR="teal"
```
