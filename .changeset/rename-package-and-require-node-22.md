---
"dev-process-manager": major
---

Rename the package to `dev-process-manager` and require Node v22 or later

The `@comet` scope has been removed to make clear that the dev-process-manager can be used outside of Comet/Dextinity. Update your dependencies accordingly:

```bash
npm uninstall @comet/dev-process-manager
npm install --save-dev dev-process-manager
```

The `dev-pm` binary, the configuration file and all commands are unchanged.

Additionally, the minimum supported Node version has been raised from v18 to v22.
