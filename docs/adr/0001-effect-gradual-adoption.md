# Gradual adoption of Effect as the primary runtime

We are adopting [Effect](https://effect.website) as a unified runtime across the codebase, replacing several smaller libraries (Remeda, ts-pattern, better-result) and eventually the HTTP layer (ORPC) and schema library (Zod). The primary motivation is typed error propagation — errors that currently escape the type system (thrown `ORPCError`, raw Prisma rejections) will be encoded in the Effect error channel, making it impossible for code (including AI-generated code) to silently miss an error path.

## Considered Options

**Full immediate rewrite** — rejected. Replacing ORPC + Prisma simultaneously would be a multi-week big-bang migration with no safe rollback point.

**Partial adoption (server only)** — rejected. Keeping Effect off the client would fragment the mental model and reduce the consolidation benefit.

**Keep existing libraries** — rejected. The current mix (Remeda, ts-pattern, better-result, ORPCError) solves the same problems Effect solves, but separately, with no unified error channel. This is especially problematic in AI-assisted development where type-system enforcement is the primary correctness guarantee.

## Migration sequence

1. **Env config** — Replace `@t3-oss/env-core` with Effect `Config` module. Client vars use a custom Vite `ConfigProvider`. This introduces Effect with zero business logic changes.
2. **Data utilities** — Replace `remeda`, `ts-pattern`, `better-result` with Effect's `Option`, `Match`, and `Effect.tryPromise`.
3. **Repository layer** — Wrap Prisma calls in `Effect.tryPromise`. Convert `createXRepository(db)` factories to Effect Services with a `Database` Layer. Migrate one feature (commute) end-to-end first, then expand.
4. **Business logic services** — Extract handler logic into Effect services. ORPC handlers become thin adapters that call `Effect.runPromise` and map Effect errors to `ORPCError`.
5. **ORPC → Effect HttpApi** *(long-term)* — Once the Layer graph is mature, replace the HTTP layer. The service Layers plug straight in.
6. **Zod → Effect Schema** *(after ORPC replacement)* — Migrate input/output schemas. Form schemas migrate independently.

## Consequences

- Prisma stays — the soft-delete extension, cursor pagination helper, and server-timing integration are non-trivial to rebuild. Prisma calls are wrapped in `Effect.tryPromise` rather than replaced.
- Zod stays until Phase 6 — ORPC's Zod integration is battle-tested and all router schemas are defined with Zod. Migrating before ORPC is replaced would be churn.
- The single Zustand store (navigation visibility, 6 lines) becomes `useState` — not worth a Layer.
- ORPC remains the HTTP transport during Phases 1–4. Effect runs inside handlers, not around them.
