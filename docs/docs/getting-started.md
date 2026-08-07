---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

# Getting Started

This guide takes you from zero to a running multi-process dev environment.

## Prerequisites

- **Node.js ≥ 18**
- An existing Node.js project (dev-process-manager drops into any project)

## 1. Install

```bash
npm install dev-process-manager
```

## 2. Add a convenient alias (recommended)

The binary is called `dev-pm`. A short alias makes day-to-day use nicer:

```bash
alias dpm="npm exec -- dev-pm"
```

Add it to your shell profile (`~/.bashrc`, `~/.zshrc`, …) to make it permanent. The
rest of this documentation uses `dpm`, but you can always run the binary directly with
`npx dev-pm`.

## 3. Create a config file

Add a `dev-pm.config.ts` file to your project root. It lists every process
dev-process-manager should manage:

```typescript title="dev-pm.config.ts"
import { defineConfig } from "dev-process-manager";

export default defineConfig({
    scripts: [
        {
            name: "api",
            script: "npm run start:api",
            waitOn: ["tcp:5432"], // wait for Postgres first
        },
        {
            name: "admin",
            script: "npm run start:admin",
        },
    ],
});
```

Other supported config file extensions are `ts`, `mts`, `cts`, `js`, `mjs`, `cjs` and
`json`. See the [Configuration reference](./configuration.md) for every available
option.

## 4. Start your processes

Start everything:

```bash
dpm start all
```

Or start a single process by name:

```bash
dpm start api
```

The daemon starts automatically the first time you run a command.

## 5. Watch what is happening

```bash
dpm status          # list running processes
dpm logs            # tail logs of all running processes
dpm logs api        # tail logs of a single process
```

## 6. Stop when you are done

```bash
dpm stop all        # stop processes
dpm shutdown        # stop everything and shut down the daemon
```

## Next steps

- Learn the full set of options in [Configuration](./configuration.md).
- Browse every command in [Commands](./commands.md).
- Copy a ready-made setup from [Examples](./examples.md).
- Let AI coding agents drive `dev-pm` with the bundled [AI Agent Skill](./agent-skills.md).
