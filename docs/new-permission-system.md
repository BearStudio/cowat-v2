# Permission System

This document explains how authorization works in this codebase and how to
maintain it. Read it before touching anything under `src/features/auth/` or
adding a new protected endpoint.

## TL;DR

Authorization answers **two different questions**, and the codebase keeps them
strictly separate:

1. **RBAC — "Does this _role_ have this _permission_?"**
   Coarse-grained, depends only on who you are (your role). Example: "can a
   `member` create invitations?".
2. **Ability / ownership — "Does this _actor_ have a relationship to this
   _specific resource_?"**
   Fine-grained, depends on the data. Example: "is this commute _mine_?". A
   `member` may edit commutes, but only the ones they drive.

An action is allowed only when **both** questions answer yes. Most bugs in
authorization come from coding one while thinking about the other.

## Architecture

The logic lives in five small, mostly **pure** modules. "Pure" means: no I/O, no
throwing, no server-only imports — so the exact same code runs on the server
(for real enforcement) and on the client (for UI gating).

| File | Responsibility | Pure / isomorphic? |
| --- | --- | --- |
| [`src/features/auth/permissions.ts`](../src/features/auth/permissions.ts) | **App-level** role + permission definitions (`admin`, `user`) | ✅ |
| [`src/features/auth/organization-permissions.ts`](../src/features/auth/organization-permissions.ts) | **Org-level** role + permission definitions (`owner`, `admin`, `member`) | ✅ |
| [`src/features/auth/rbac.ts`](../src/features/auth/rbac.ts) | `(role, permission) => boolean` — the RBAC check | ✅ |
| [`src/features/auth/ability/actor.ts`](../src/features/auth/ability/actor.ts) | `Actor` — a minimal description of "who is acting" | ✅ |
| [`src/features/auth/ability/abilities.ts`](../src/features/auth/ability/abilities.ts) | `(actor, resource) => Decision` — ownership / relation / self-action / hierarchy checks | ✅ |
| [`src/features/auth/ability/enforce.ts`](../src/features/auth/ability/enforce.ts) | Turns a denied `Decision` into an `ORPCError` | ❌ server-only |

The guiding pattern is **functional core, imperative shell**: all reasoning is
pure and returns a value; the single impure act (throwing an HTTP error) is
isolated in `enforce`.

```
                 ┌─────────────────────────────────────────┐
                 │              PURE CORE                  │
                 │  (runs on server AND client)            │
                 │                                         │
   role ────────►│  rbac.ts        checkAppPermission()    │──► boolean
                 │                 checkOrgPermission()    │
                 │                                         │
 actor+resource ►│  abilities.ts   isDriverOf(), …         │──► Decision
                 └─────────────────────────────────────────┘
                                     │
                                     ▼  (server only)
                 ┌─────────────────────────────────────────┐
                 │            IMPERATIVE SHELL             │
                 │ enforce(decision)  ──► throws ORPCError │
                 └─────────────────────────────────────────┘
```

## Part 1 — RBAC (role → permission)

### Where roles and permissions are defined

There are **two independent access-control systems**. Do not confuse them.

#### App-level — [`permissions.ts`](../src/features/auth/permissions.ts)

Global platform roles, stored on `User.role`. Built with Better Auth's
`createAccessControl`.

- **`user`**: `account:['update']`, `apps:['app']`
- **`admin`** (back-office): everything `adminAc` grants, plus
  `account:['update']`, `apps:['app','manager']`,
  `organization:['list','create','delete']`

#### Org-level — [`organization-permissions.ts`](../src/features/auth/organization-permissions.ts)

Roles _within_ an organization, stored on `Member.role`. A user has one
`Member` record per organization, so these roles are **scoped to a single org**
(being `owner` of org A grants nothing in org B).

Custom resource statements: `commute`, `booking`, `location`,
`commuteTemplate` (CRUD-ish), the manager-level `stats` (admin + owner), plus
the owner-only `orgNotificationChannel`.

| Permission | `member` | `admin` | `owner` |
| --- | :---: | :---: | :---: |
| commute / location / commuteTemplate (CRUD) | ✅ | ✅ | ✅ |
| booking (read/manage/request) | ✅ | ✅ | ✅ |
| member (create/update/delete) | ❌ | ✅ | ✅ |
| invitation (create/cancel) | ❌ | ✅ | ✅ |
| organization: update | ❌ | ✅ | ✅ |
| **stats: read** | ❌ | ✅ | ✅ |
| **organization: delete** | ❌ | ❌ | ✅ |
| **orgNotificationChannel: manage** | ❌ | ❌ | ✅ |

Rights ranking: **owner > admin > member**. The only things separating org
`admin` from `owner` are deleting the organization and managing notification
channels.

### How RBAC is checked — [`rbac.ts`](../src/features/auth/rbac.ts)

Two pure functions reuse the Better Auth role definitions directly via
`role.authorize(permission)` (no network call):

```ts
checkAppPermission(appRole, permission): boolean   // app-level
checkOrgPermission(orgRole, permission): boolean   // org-level
```

Two important properties:

- **Fail-closed.** A `null`/empty role grants **nothing**. There is no
  `role ?? 'user'` fallback. When in doubt, deny.
- **Multi-role aware.** Better Auth stores roles as CSV (`"admin,user"`). The
  check splits on `,` and authorizes if **any** role grants the permission.

> **Why not `auth.api.userHasPermission`?** That endpoint is a POST handler
> whose internal dispatch goes through the TanStack Start / Nitro pipeline and
> hangs (it needs the request body). The computation is pure and we already
> hold the role in-process, so we call `authorize()` directly — correct and
> faster, and tests now exercise the same path as prod.

## Part 2 — Abilities (actor → resource)

### The `Actor` — [`actor.ts`](../src/features/auth/ability/actor.ts)

A minimal, server-agnostic description of who is acting: `userId`, `appRole`,
and (when an org is active) `organizationId`, `memberId`, `orgRole`,
`sessionToken`. Build it from the oRPC context with `actorFromContext(context)`.

### The `Decision` and abilities — [`abilities.ts`](../src/features/auth/ability/abilities.ts)

An ability is a **pure function that never throws**. It returns a `Decision`:

```ts
type Decision =
  | { ok: true }
  | { ok: false; code: 'NOT_FOUND' | 'FORBIDDEN' | 'BAD_REQUEST'; message?: string };
```

Returning a value (instead of throwing) is what makes abilities reusable on the
client: the server passes the `Decision` to `enforce`, while the client reads it
to gray out a button — without ever raising an error.

Abilities are grouped into four families:

1. **Ownership** — `canMutateOwnedResource` (am I the resource's driver, via
   `driverMemberId`?) and `isOwnerByMemberId` (do I own a resource held
   directly by `memberId`, e.g. a `Location`?).
2. **Relation** — `isDriverOf`, `isPassengerOf`, `isRequesterOf`,
   `isNotOwnCommute`.
3. **Self-action prevention** — `isNotSelfByUserId`, `isNotSelfByMemberId`,
   `isNotCurrentSession` (each takes the error message as a parameter).
4. **Hierarchy** — `canAssignRole` (only an owner may assign the `owner` role)
   and `canActOnMember` (only an owner may update/delete another `owner`).

Helpers: `allow`, `deny(code, message)`, and `all(...decisions)` (returns the
first denial, else `allow`).

### Enforcement — [`enforce.ts`](../src/features/auth/ability/enforce.ts)

The **only** place a denied `Decision` becomes an HTTP error:

```ts
enforce(decision);                  // throws ORPCError if !decision.ok
enforceOwnership(actor, resource);  // enforce + narrows resource to non-null
```

`enforceOwnership` also acts as a type guard: after it runs, TypeScript knows
`resource` is non-null for the rest of the handler.

## How the two parts combine in a request

RBAC is checked **at the procedure boundary**; abilities are checked **inside
the handler** once the resource has been loaded.

### Procedures — [`orpc.ts`](../src/server/orpc.ts)

- `protectedProcedure({ permission })` — requires auth; if `permission` is set,
  runs `checkAppPermission`.
- `organizationProcedure({ permissions })` — requires auth + membership in the
  active org; if `permissions` is set, runs `checkOrgPermission` against the
  member's role. It injects `organizationId`, `memberId`, `orgRole`, and
  `orgSlug` into the handler context.

### A typical handler

```ts
// 1. RBAC at the boundary: only roles with `booking:['manage']` get here.
accept: organizationProcedure({ permissions: { booking: ['manage'] } })
  .handler(async ({ context, input }) => {
    const booking = await context.bookings.findForDriverAction(input.id);
    if (!booking) throw new ORPCError('NOT_FOUND');

    // 2. Ability inside the handler: must be THIS commute's driver.
    enforce(
      isDriverOf(actorFromContext(context))({
        driverMemberId: booking.stop.commute.driverMemberId,
      })
    );

    // …safe to mutate
  });
```

(See [`booking.ts`](../src/server/routers/booking.ts) — the router aliases
`organizationProcedure` locally as `procedure`.)

### Client UI gating

The client uses the **same** pure functions, so UI and server never diverge:

- [`with-permission.tsx`](../src/features/auth/with-permission.tsx) →
  `checkAppPermission`
- [`with-org-permissions.tsx`](../src/features/auth/with-org-permissions.tsx) →
  `checkOrgPermission`
- [`guard-organization.tsx`](../src/features/organization/guard-organization.tsx)
  → `checkOrgPermission` (via its optional `organizationPermission` prop)

> ℹ️ **`guard-organization.tsx` is org-only.** It accepts an optional
> `organizationPermission` prop and gates the route with `checkOrgPermission`
> against the active org's role; when the prop is omitted it only resolves the
> active org and renders the children. There is **no** app-level escape hatch:
> an app role never grants access to an org screen here. As always, this guard
> is **client-side UX only** — the server's `organizationProcedure` authorizes
> every request on its own.

## Maintenance guide

### Golden rules

1. **Client checks are UX. The server is the source of truth.** Never rely on a
   client guard for security — always enforce on the server too.
2. **Fail-closed.** A missing role/permission must deny. Never add a default
   role fallback.
3. **Keep the core pure.** `actor.ts`, `abilities.ts`, and `rbac.ts` must not
   import server-only modules and must not throw. Only `enforce.ts` throws.
4. **Pick the right axis.** Role-gating → RBAC at the procedure. "Is this object
   mine?" → an ability inside the handler.

### Adding a new permission to an existing role

1. Add the action to the relevant `statement` in `permissions.ts` (app) or
   `organization-permissions.ts` (org).
2. Grant it to the appropriate `ac.newRole({ … })` definitions.
3. Gate the endpoint: `protectedProcedure({ permission: … })` or
   `organizationProcedure({ permissions: … })`.
4. Gate the UI with `WithPermissions` / `WithOrgPermissions` if needed.

### Adding a new ownership / relation / self-action rule

1. Add a pure ability to `abilities.ts` returning a `Decision` (use `deny`/
   `allow`). Reproduce the exact `code` + `message` of any guard you replace.
2. Call it in the handler via `enforce(myAbility(actor)(resource))`.
3. Add a unit test in
   [`abilities.unit.spec.ts`](../src/features/auth/ability/abilities.unit.spec.ts)
   — both the allow and the deny path.

### Adding a new protected endpoint — checklist

- [ ] Choose `protectedProcedure` (app) or `organizationProcedure` (org).
- [ ] Set the RBAC `permission`/`permissions` if the action is role-gated.
- [ ] After loading the resource, `enforce` any ownership/relation ability.
- [ ] Handle `NOT_FOUND` before `FORBIDDEN` where ability functions don't
      already (most relation abilities return `NOT_FOUND` for a missing
      resource).
- [ ] Add/extend unit tests.

### Common pitfalls

- **Comparing the wrong identifier.** A member-management input may be a
  `memberId` or an email, **not** a `userId`. Compare against the right field
  (`context.memberId` / `context.user.email`), or the guard silently never
  fires.
- **Throwing inside an ability.** Don't. Return a `Decision`; let `enforce`
  throw. Otherwise the ability can't be reused on the client.
- **Forgetting the resource-level check.** Passing the RBAC gate only means your
  role _may_ perform the action in general — you must still verify the actor's
  relationship to the specific resource.
- **Defining a role-only rule as an ability (or vice-versa).** Caller
  restrictions like "only owner/admin can invite" belong in RBAC
  (`invitation:['create']`), not a hand-written membership lookup.

## Related files

- Procedures & context injection: [`src/server/orpc.ts`](../src/server/orpc.ts)
- Example handlers: [`src/server/routers/booking.ts`](../src/server/routers/booking.ts),
  [`src/server/routers/organization.ts`](../src/server/routers/organization.ts)
  (`canActOnMember`), [`src/server/routers/location.ts`](../src/server/routers/location.ts)
  (`isOwnerByMemberId`), [`src/server/routers/user.ts`](../src/server/routers/user.ts)
- Ability tests:
  [`src/features/auth/ability/abilities.unit.spec.ts`](../src/features/auth/ability/abilities.unit.spec.ts)
