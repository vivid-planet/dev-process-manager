---
id: api-reference
title: API Reference
sidebar_label: API Reference
---

# API Reference

dev-process-manager is used in two ways:

1. **Programmatically** — via the small module API you import in your
   `dev-pm.config.ts`.
2. **From the command line** — via the `dev-pm` binary (see [Commands](./commands.md)).

This page documents the programmatic module API. The package is published as
[`@comet/dev-process-manager`](https://www.npmjs.com/package/@comet/dev-process-manager)
and ships as an **ES module** with TypeScript type definitions.

## Exports

```typescript
import { defineConfig, type Config } from "@comet/dev-process-manager";
```

| Export                             | Kind     | Description                                          |
| ---------------------------------- | -------- | ---------------------------------------------------- |
| [`defineConfig`](#defineconfig)    | function | Identity helper that types your configuration.       |
| [`Config`](#config)                | type     | The shape of a dev-process-manager configuration.    |

---

## `defineConfig`

```typescript
function defineConfig(config: Config): Config;
```

A helper that returns the config object it is given, unchanged. Its purpose is to give
you **type checking and editor autocompletion** for your configuration without having
to write an explicit type annotation.

**Parameters**

- `config: Config` — your dev-process-manager configuration.

**Returns**

- The same `Config` object, so it can be used directly as the default export.

**Example**

```typescript title="dev-pm.config.ts"
import { defineConfig } from "@comet/dev-process-manager";

export default defineConfig({
    scripts: [{ name: "api", script: "npm run start" }],
});
```

Using `defineConfig` is optional but recommended. A plain object export works too:

```typescript title="dev-pm.config.ts"
import type { Config } from "@comet/dev-process-manager";

const config: Config = {
    scripts: [{ name: "api", script: "npm run start" }],
};

export default config;
```

---

## `Config`

```typescript
interface Config {
    scripts: Omit<ScriptDefinition, "id">[];
}
```

The top-level configuration object.

| Property  | Type                             | Required | Description                              |
| --------- | -------------------------------- | -------- | ---------------------------------------- |
| `scripts` | `Omit<ScriptDefinition, "id">[]` | ✅       | The processes to manage. See below.      |

---

## `ScriptDefinition`

Describes a single managed process. The `id` field is assigned by the daemon at
runtime, so you never provide it (that is why `Config.scripts` uses
`Omit<ScriptDefinition, "id">`).

```typescript
interface ScriptDefinition {
    id: number; // assigned by the daemon — do not set
    name: string;
    script: string;
    alias?: string | string[];
    group?: string | string[];
    waitOn?: string | string[];
    env?: NodeJS.ProcessEnv;
}
```

| Property | Type                   | Required | Description                                                                   |
| -------- | ---------------------- | -------- | ----------------------------------------------------------------------------- |
| `id`     | `number`               | —        | Assigned by the daemon at runtime. Not set by you.                            |
| `name`   | `string`               | ✅       | Unique identifier, used in commands and log prefixes.                         |
| `script` | `string`               | ✅       | Shell command, executed with `bash -c`.                                       |
| `alias`  | `string \| string[]`   |          | Alternative name(s) usable in every command.                                  |
| `group`  | `string \| string[]`   |          | Group name(s); target with `@groupname`.                                      |
| `waitOn` | `string \| string[]`   |          | Resource(s) to wait for before starting (files, `tcp:<port>`, …).             |
| `env`    | `NodeJS.ProcessEnv`    |          | Extra environment variables merged on top of the inherited environment.       |

See [Configuration](./configuration.md) for detailed, field-by-field explanations and
runtime behavior (auto-restart, `PATH` handling, environment file loading and more).

---

## Runtime behavior

A few behaviors are useful to know when writing configs:

- **Shell execution** — each `script` runs through `bash -c`, so pipes, `&&` and shell
  expansion work.
- **Local binaries on `PATH`** — your project's `node_modules/.bin` is prepended to
  `PATH`, so locally installed CLIs run without `npx`.
- **Automatic restart** — a process that exits unexpectedly is restarted with
  exponential backoff (capped at 10 seconds between attempts).
- **Environment files** — `.env` then `.env.local` are read (with variable expansion;
  `.env.local` wins) **only** to expand variables inside [`waitOn`](./configuration.md#waiton).
  They are **not** injected into executed scripts; use the [`env`](./configuration.md#env)
  option for that.

## CLI reference

For the complete command-line interface — `start`, `stop`, `restart`, `status`,
`logs`, `shutdown` and `start-daemon`, including options and pattern matching — see the
[Commands](./commands.md) page.
