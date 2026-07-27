---
"@comet/dev-process-manager": major
---

Upgrade dependencies to their latest major versions

Notable changes:

-   Require Node.js v22 or later. Several updated dependencies (`@comet/eslint-config`, `log-update`, `lint-staged`, `npm-run-all2`) now require Node.js >= 22.
-   Runtime dependencies bumped to new majors: `commander` 15, `dotenv` 17, `dotenv-expand` 13, `log-update` 8, `pidtree` 1, `pidusage` 4, `pretty-bytes` 7, `wait-on` 9.
-   Tooling bumped to new majors: `@comet/eslint-config` 9, `eslint` 10, `npm-run-all2` 9, `@types/node` 26.

`dotenv` v17 prints an informational message on load by default; the daemon now passes `quiet: true` to keep the previous silent behavior.
