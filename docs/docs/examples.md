---
id: examples
title: Examples
sidebar_label: Examples
---

# Examples

Ready-to-adapt configurations for common setups. Each one goes in `dev-pm.config.ts`
at your project root.

## Minimal: two processes

The smallest useful config — an API and an admin dev server.

```typescript title="dev-pm.config.ts"
import { defineConfig } from "@comet/dev-process-manager";

export default defineConfig({
    scripts: [
        { name: "api", script: "npm run start:api" },
        { name: "admin", script: "npm run start:admin" },
    ],
});
```

```bash
dpm start all
dpm logs
```

## Waiting for a database and a build

The API waits for Postgres to accept connections and for a shared package to be built
before it starts.

```typescript title="dev-pm.config.ts"
import { defineConfig } from "@comet/dev-process-manager";

export default defineConfig({
    scripts: [
        {
            name: "shared",
            script: "npm run build:watch --workspace=packages/shared",
        },
        {
            name: "api",
            script: "npm run start:api",
            waitOn: [
                "packages/shared/lib/index.d.ts", // wait until "shared" has built
                "tcp:5432",                        // wait until Postgres is up
            ],
        },
    ],
});
```

## Using environment variables in `waitOn`

Environment variables from `.env` / `.env.local` are expanded inside `waitOn`, so
ports are not hard-coded.

```bash title=".env"
POSTGRESQL_PORT=5432
```

```typescript title="dev-pm.config.ts"
import { defineConfig } from "@comet/dev-process-manager";

export default defineConfig({
    scripts: [
        {
            name: "api",
            script: "npm run start:api",
            waitOn: ["tcp:$POSTGRESQL_PORT"],
        },
    ],
});
```

## Groups and aliases

Organize a larger stack into groups so you can start slices of it, and add aliases for
convenience.

```typescript title="dev-pm.config.ts"
import { defineConfig } from "@comet/dev-process-manager";

export default defineConfig({
    scripts: [
        {
            name: "api",
            script: "npm run start:api",
            alias: "backend",
            group: "server",
            waitOn: ["tcp:5432"],
        },
        {
            name: "worker",
            script: "npm run start:worker",
            group: "server",
            waitOn: ["tcp:5432"],
        },
        {
            name: "admin",
            script: "npm run start:admin",
            group: "frontend",
        },
        {
            name: "site",
            script: "npm run start:site",
            group: "frontend",
        },
    ],
});
```

```bash
dpm start @frontend      # start admin + site
dpm restart backend      # restart api via its alias
dpm stop @server         # stop api + worker
dpm status -i 2          # watch the whole stack refresh every 2s
```

## Per-process environment variables

Give one process its own environment values.

```typescript title="dev-pm.config.ts"
import { defineConfig } from "@comet/dev-process-manager";

export default defineConfig({
    scripts: [
        {
            name: "api",
            script: "npm run start:api",
            env: {
                NODE_ENV: "development",
                DEBUG: "app:*",
            },
        },
    ],
});
```

## A full monorepo stack

A more complete example bringing several of the features together.

```typescript title="dev-pm.config.ts"
import { defineConfig } from "@comet/dev-process-manager";

export default defineConfig({
    scripts: [
        {
            name: "db",
            script: "docker compose up postgres",
            group: "infra",
        },
        {
            name: "api",
            script: "npm run start:api",
            alias: "backend",
            group: "server",
            waitOn: ["tcp:$POSTGRESQL_PORT", "packages/api-client/lib/index.d.ts"],
            env: { NODE_ENV: "development" },
        },
        {
            name: "worker",
            script: "npm run start:worker",
            group: "server",
            waitOn: ["tcp:$POSTGRESQL_PORT"],
        },
        {
            name: "admin",
            script: "npm run start:admin",
            group: "frontend",
            waitOn: ["tcp:$API_PORT"],
        },
        {
            name: "site",
            script: "npm run start:site",
            group: "frontend",
            waitOn: ["tcp:$API_PORT"],
        },
    ],
});
```

```bash
# Bring the whole environment up
dpm start all

# Or work on just the frontend against an already-running backend
dpm start @server
dpm start @frontend --follow
```
