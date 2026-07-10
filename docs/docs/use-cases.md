---
id: use-cases
title: Use Cases
sidebar_label: Use Cases
---

# Use Cases

dev-process-manager is built for **local development**, where you routinely need
several long-running processes at the same time. Here are the situations it was
designed for.

## Run a multi-process application with one command

Modern applications are made of many moving parts: an API server, a frontend dev
server, background workers, asset/type watchers, and supporting services. Starting
each one in its own terminal tab is tedious and error-prone.

With a single `dev-pm.config.ts` you describe every process once, then bring the whole
stack up with:

```bash
dpm start all
```

All logs are interleaved and prefixed with the process name, so you have one place to
watch what is happening.

## Start processes in the right order

Some processes cannot start until something else is ready — a shared library must be
compiled first, a database must accept connections, or a port must be open.

The [`waitOn`](./configuration.md#waiton) option lets each process declare what it
depends on:

```typescript
{
    name: "api",
    script: "npm run start",
    waitOn: [
        "packages/shared/lib/index.d.ts", // wait until a package is built
        "tcp:5432",                        // wait until Postgres accepts connections
    ],
}
```

The process stays in a `waiting` state until every resource is available, then boots
automatically.

## Work on just one part of a large stack

You do not always want everything running. Groups and aliases let you control exactly
the subset you care about:

```bash
dpm start @frontend      # start everything in the "frontend" group
dpm restart api          # restart a single process (or its alias)
dpm stop @backend        # stop a whole group
dpm logs api,worker      # tail two processes at once
```

This is ideal in a monorepo where different teams work on different slices of the
system.

## Keep flaky services alive

During development, services crash — a bad save, a failed migration, a transient
dependency. dev-process-manager restarts crashed processes automatically using
**exponential backoff**, so a single flaky service does not force you to restart your
whole environment by hand.

## Share a reproducible dev setup across a team

Because the whole environment is described in a committed `dev-pm.config.ts` (plus a
committed `.env` for shared defaults), every developer gets the **same startup
sequence** out of the box. New team members can clone, install and run one command
instead of following a long "how to run things locally" wiki page.

## Integrate into CI-like local checks

Since scripts are just shell commands, you can point processes at watchers, linters or
type-checkers and keep them running alongside the app during development, catching
problems as you code.

## When *not* to use it

dev-process-manager targets **local development**. It is not a production process
supervisor — for production you want a tool such as systemd, Docker/Kubernetes, or
PM2 in cluster mode. dev-process-manager focuses on making the local, multi-process
developer experience pleasant.
