---
id: intro
title: Introduction
sidebar_label: Introduction
---

# dev-process-manager

**dev-process-manager** (`dpm` / `dev-pm`) is a Node.js process manager for local
development environments that need to run **multiple processes at once**. It can be
integrated into any existing Node.js project with a single config file.

A typical web application is rarely a single process during development. You might
need an API, a frontend dev server, a background worker, an asset watcher and a
database — all running together, in the right order, with their logs interleaved in
one place. dev-process-manager makes that a one-command experience.

```bash
dpm start all
```

## Highlights

- **One command to run your whole stack** — start every process your app needs together.
- **Ordered startup** — use [`waitOn`](./configuration.md#waiton) to wait for build
  artifacts, TCP ports or databases before a process boots.
- **Groups & aliases** — address processes individually, by alias, or as named
  `@groups`.
- **Automatic crash recovery** — crashed processes restart with exponential backoff.
- **Config as code** — a single typed `dev-pm.config.ts` describes everything.
- **Environment files** — `.env` and `.env.local` are read (with variable expansion) to
  resolve [`waitOn`](./configuration.md#waiton) resources.

## How it works

dev-process-manager runs a lightweight **daemon** in the background. The `dev-pm`
command line talks to that daemon over a local socket. When you run `dpm start`, the
daemon is started automatically if it is not already running, launches the requested
processes and keeps them alive. Logs are buffered by the daemon so you can attach to
them at any time with `dpm logs`.

## Where to go next

- New here? Start with the [Use Cases](./use-cases.md) to see where dev-process-manager fits.
- Weighing your options? See the [Comparison with alternatives](./comparison.md) (pm2, terminal tabs, Docker Compose and more).
- Ready to try it? Follow the [Getting Started](./getting-started.md) guide.
- Looking for the full config surface? See the [Configuration](./configuration.md)
  reference.
- Want to copy-paste something real? Jump to [Examples](./examples.md).

:::note
This project is developed and maintained by
[Vivid Planet Software GmbH](https://www.vivid-planet.com/) and published on npm as
[`@comet/dev-process-manager`](https://www.npmjs.com/package/@comet/dev-process-manager).
:::
