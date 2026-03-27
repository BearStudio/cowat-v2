# Project Conventions

## PR Title

PR titles **must** match: `(feat|fix|chore|test|docs)(<scope>)?: <description>`

Examples: `feat: add login page`, `fix(auth): token expiry`, `chore: drop legacy api`

This is enforced by CI (`.github/workflows/branch-name.yml`).

## Pull Requests

Always open PRs in **draft** mode. Never open a PR as ready to review directly.

## Soft-delete extension

Models listed in `SOFT_DELETE_MODELS` in `src/server/db/index.ts` (currently `Location`, `Commute`, `CommuteTemplate`) have a Prisma client extension (`$extends`) that:

- **Read operations** (`findFirst`, `findMany`, `findUnique`, `count`, etc.) automatically add `isDeleted: false` to the where clause.
- **`delete`** is intercepted and converted to `update({ data: { isDeleted: true } })`.
- **`deleteMany`** is intercepted and converted to `updateMany({ data: { isDeleted: true } })`.

When deleting these models in router handlers, use `context.db.<model>.delete()` — do **not** manually set `isDeleted: true` via `update()`. The extension handles it.
