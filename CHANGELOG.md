# Changelog

## 2.0.0

_TBD_

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
