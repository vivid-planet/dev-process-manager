---
id: configuration
title: Configuration
sidebar_label: Configuration
---

# Configuration

dev-process-manager is configured with a single file at your project root:
`dev-pm.config.<ext>`. Supported extensions are `ts`, `mts`, `cts`, `js`, `mjs`,
`cjs` and `json`.

The file must have a **default export** containing a config object with a `scripts`
array. Using [`defineConfig`](./api-reference.md#defineconfig) gives you full type
checking and autocompletion:

```typescript title="dev-pm.config.ts"
import { defineConfig } from "@comet/dev-process-manager";

export default defineConfig({
    scripts: [
        {
            name: "api",
            script: "npm run start",
            alias: "backend",
            group: ["foo", "bar"],
            waitOn: ["packages/foo/lib/index.d.ts", "tcp:5432"],
            env: { NODE_ENV: "development" },
        },
    ],
});
```

## Config object

| Field     | Type                          | Required | Description                                       |
| --------- | ----------------------------- | -------- | ------------------------------------------------- |
| `scripts` | `ScriptDefinition[]`          | ✅       | The processes dev-process-manager should manage.  |

## Script definition

Each entry in `scripts` describes one process.

| Field     | Type                   | Required | Description                                                                 |
| --------- | ---------------------- | -------- | --------------------------------------------------------------------------- |
| `name`    | `string`               | ✅       | Unique name used to address the process in every command and in log prefixes. |
| `script`  | `string`               | ✅       | The shell command to run (executed with `bash -c`).                         |
| `alias`   | `string \| string[]`   |          | Alternative name(s) to address the script in all commands.                  |
| `group`   | `string \| string[]`   |          | Group name(s); address a whole group with `@groupname`.                     |
| `waitOn`  | `string \| string[]`   |          | Resource(s) to wait for before starting (files, TCP ports, …).              |
| `env`     | `NodeJS.ProcessEnv`    |          | Extra environment variables, merged on top of the process environment.      |

:::note
The `id` field is assigned automatically by the daemon — you never set it yourself.
:::

### `name`

The primary identifier for a process. It must be unique. dev-process-manager prefixes
every log line with the process name (in a per-process color) so interleaved output
stays readable.

### `script`

The command to run. It is executed with `bash -c`, so shell features (pipes, `&&`,
environment expansion) work as expected. dev-process-manager prepends your project's
`node_modules/.bin` to `PATH`, so locally installed CLIs are available without `npx`.

If a process exits unexpectedly, it is **restarted automatically** with exponential
backoff (increasing delay between attempts, capped at 10 seconds).

### `alias`

One or more alternative names. Anywhere you can pass a process name, you can also pass
an alias:

```typescript
{ name: "api", script: "npm run start", alias: "backend" }
```

```bash
dpm restart backend   # same as: dpm restart api
```

### `group`

One or more group names. Groups let you act on several processes at once using the
`@` prefix:

```typescript
{ name: "api", script: "npm run start", group: ["backend", "core"] }
```

```bash
dpm start @backend    # starts every script in the "backend" group
```

### `waitOn`

Delays starting a process until one or more resources are available. Values are passed
to [`wait-on`](https://www.npmjs.com/package/wait-on), so you can wait on:

- **Files** — `"packages/foo/lib/index.d.ts"` (wait until a package is built)
- **TCP ports** — `"tcp:5432"` (wait until a database accepts connections)

While waiting, the process is shown with the `waiting` status. Once every resource is
available, the process starts automatically.

Environment variables are expanded inside `waitOn` values, so you can write:

```typescript
waitOn: ["tcp:$POSTGRESQL_PORT"]
```

### `env`

Extra environment variables for this specific process. They are merged on top of the
inherited process environment (and the loaded `.env` files), taking precedence:

```typescript
{ name: "api", script: "npm run start", env: { NODE_ENV: "development", DEBUG: "app:*" } }
```

## Environment variables

dev-process-manager automatically loads environment variables from the following files
in the project root, in order:

1. `.env` — shared defaults, typically committed to version control.
2. `.env.local` — local overrides, typically added to `.gitignore`.

Values in `.env.local` take precedence over those in `.env`. **Variable expansion**
(e.g. `$OTHER_VAR`) is supported in both files.

```bash title=".env"
POSTGRESQL_PORT=5432
DATABASE_URL=postgres://localhost:$POSTGRESQL_PORT/app
```
