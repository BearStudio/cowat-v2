---
paths: 
  - src/**/routers/*.{ts,tsx}
---


- Always use `ORPCError` from `@orpc/client` to throw errors in router handlers. Never use plain `Error`.
