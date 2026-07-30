---
id: commands
title: Commands
sidebar_label: Commands
---

# Commands

All commands are run through the `dev-pm` binary. The examples below assume the
recommended alias `dpm` (see [Getting Started](./getting-started.md)); you can also use
`npx dev-pm` directly.

## Targeting processes

Most commands accept a `[patterns...]` argument that selects which processes to act on.
A pattern can be:

| Pattern       | Matches                                             |
| ------------- | --------------------------------------------------- |
| `name`        | A process by its `name`.                            |
| `alias`       | A process by one of its `alias` values.             |
| `@group`      | Every process in the named `group`.                 |
| `id`          | A process by its numeric daemon-assigned id.        |
| `all`         | Every configured process.                           |
| _(omitted)_   | Every process (same as `all`).                      |

You can pass **multiple patterns**, separated by spaces or commas:

```bash
dpm start api worker
dpm logs api,worker
```

## `start`

Start one or all processes.

```bash
dpm start [options] [patterns...]
```

**Options**

- `--follow` — follow logs after starting. The started process will **not** be stopped
  when you stop this `start` command (Ctrl-C only detaches from the logs).

```bash
dpm start all
dpm start api --follow
dpm start @frontend
```

## `stop`

Stop running processes.

```bash
dpm stop [patterns...]
```

```bash
dpm stop api
dpm stop @backend
dpm stop all
```

## `restart`

Restart previously started processes.

```bash
dpm restart [options] [patterns...]
```

**Options**

- `--follow` — follow logs after restarting (see `start`).

```bash
dpm restart api
dpm restart @frontend --follow
```

## `status`

List running processes and their state. Aliases: `list`, `ls`, `st`.

```bash
dpm status [options] [patterns...]
```

**Options**

- `-i, --interval [seconds]` — keep the status view open and refresh it periodically at
  the given interval (defaults to `1` second when the flag is given without a value).

```bash
dpm status
dpm status --interval        # refresh every second
dpm status -i 5              # refresh every 5 seconds
```

Each process reports one of the following statuses: `started`, `stopping`, `stopped`,
`waiting` (blocked on a [`waitOn`](./configuration.md#waiton) resource) or `backoff`
(waiting between automatic restart attempts after a crash).

## `logs`

Print logs of a specific process or of all running processes in real time. Alias:
`log`.

```bash
dpm logs [options] [patterns...]
```

**Options**

- `-n, --lines <number>` — print the last _n_ log lines and exit instead of streaming.

```bash
dpm logs               # stream logs of all running processes
dpm logs api           # stream logs of a single process
dpm logs api -n 50     # print the last 50 lines and exit
```

## `shutdown`

Stop all running processes and shut down the dev-pm daemon. Alias: `halt`.

```bash
dpm shutdown
```

## `start-daemon`

Start the dev-pm daemon. This is normally done **automatically** by other commands, so
you rarely need to call it directly.

```bash
dpm start-daemon
```

## `--version`

Print the installed version.

```bash
dpm --version
```
