---
"@comet/dev-process-manager": minor
---

Add support for defining typed config using defineConfig helper

This pattern follows vite.config.ts defineConfig helper and is implemented using [unconfig](https://github.com/antfu-collective/unconfig).

Example `dev-pm.config.ts`:
```ts
import { defineConfig } from '@comet/dev-process-manager';

export default defineConfig({
    scripts: [
        {
             name: "api",
             script: "npm run start-api"
        },
    ],
});
```