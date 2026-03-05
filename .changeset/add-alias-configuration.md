---
"@comet/dev-process-manager": minor
---

Add `alias` configuration option to scripts that allows setting alternative names for matching scripts

Scripts can now have one or more aliases that can be used to reference them in all commands (start, stop, restart, logs, status).

Example:

```ts
import { defineConfig } from "@comet/dev-process-manager";

export default defineConfig({
    scripts: [
        {
            name: "api",
            alias: "backend",
            script: "npm run start-api",
        },
        {
            name: "admin",
            alias: ["cms", "backoffice"],
            script: "npm run start-admin",
        },
    ],
});
```

With the above config, `dev-pm start backend` is equivalent to `dev-pm start api`, and `dev-pm start cms` is equivalent to `dev-pm start admin`.
