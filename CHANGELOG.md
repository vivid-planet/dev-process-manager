# Changelog

## 2.7.1

### Patch Changes

-   bd73124: Update `wait-on` to v8.0.4 to fix [CVE-2025-7783](https://github.com/advisories/GHSA-fjxv-7rqg-78g4)

## 2.7.0

### Minor Changes

-   0e94d06: Don't inject .env file as real environment variables for child processes

    This can cause problems when the child process has a custom .env loading mechanism (e.g., additional files such as .env.secrets), but dev-pm sets environment variables which overrule the values loaded by the child process.

-   ee3ebf8: Watch dev-pm.config.js and update in running daemon

    This allows modifications without having to shutdown the deamon.

    -   processes are not restarted if the script command changes
    -   processes are stopped if the script is removed
    -   processes are not started if a new script is added
    -   identifier for updates is the name of a script

## 2.6.1

### Patch Changes

-   d62d43b: Fix pretty-bytes dependency

    Since v6 pretty-bytes is an ESM-only package.
    This doesn't work with our CommonJS setup, causing the dev-process-manager to fail during startup.

## 2.6.0

### Minor Changes

-   6331bc6: upgrade wait-on to get rid of axios vulnerability

## 2.5.1

### Patch Changes

-   544a42d: Fix script matching via groups, for example, `npx dev-pm logs @api`

## 2.5.0

### Minor Changes

-   010e766: Change maximum backoff time from 30s to 10s
-   96cd913: every script is now accessible through an dedicated numeric id
-   911589a: Expose config type

    Can be used to type check the configuration file. See [example/dev-pm.config.js](example/dev-pm.config.js) for an example.

### Patch Changes

-   5eb9f4f: Remove `@changesets/cli` as dependency

## 2.4.0

### Minor Changes

-   f8001f7: Report memory/cpu usage recursively for child processes
-   084d868: allow overriding of env per script

## 2.3.2

### Patch Changes

-   05cdda9: Test release for testing the new pipelines

## 2.3.1

### Patch Changes

-   5979a6b: Add changesets for managing changelogs

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
