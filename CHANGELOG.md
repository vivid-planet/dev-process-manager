# Changelog

## 2.3.1

### Patch Changes

-   9a06ebc: Add changesets for managing changelogs

## NEXT

_TBA_

### Changes

## 2.3.0

_Mar 6, 2023_

### Changes

-   add shortcuts `list` and `ls` for `status`, `log` for `logs` and `halt` for `shutdown`
-   Fix bug with wrong cwd when (auto-)starting daemon in subfolder
-   Add support for NPM v9

## 2.2.0

_Feb 2, 2023_

### Changes

-   add support for .env files using dotenv and dotenv-expand to allow usage of .env vars in waitOn
-   change stop signal from SIGKILL to SIGINT (to fix issues with stopping docker)
-   change maximum backoff time from 120s to 30s
-   less strict engine specification (only require node >= 14)

## 2.1.0

_Jan 11, 2023_

### Changes

-   support running dev-pm in any subfolder by looking for dev-pm.config.js in parent folders

## 2.0.0

_Nov 28, 2022_

### Highlights

-   Daemonization of the dev-process-manager
-   Support for process groups
-   Starting of individual processes with `dev-pm start (name|@group)`
-   `waitOn` support to wait for conditions before starting

### Breaking changes

-   Rename binary to `dev-pm`
-   Remove support to pass config file via CLI argument

### Changes

-   Make `dev-pm start` more flexible by allowing to start individual processes using `dev-pm start (name|@group)`
-   Add `dev-pm stop (name|@group)` command to stop process
-   `dev-pm start` does not block anymore thanks to daemonization
-   Add `--follow` option to `dev-pm (start|restart)` commands to follow logs after start
-   Add CPU/memory usage to `dev-pm status` output
-   Add `--interval` option to `dev-pm status` to keep it open and optionally refresh periodically
-   Add exponential growing backoff wait time between restarts when a process crashes

## 1.0.0

_May 25, 2022_

Initial release
