---
"@comet/dev-process-manager": patch
---

Fix pretty-bytes dependency

Since v6 pretty-bytes is an ESM-only package.
This doesn't work with our CommonJS setup, causing the dev-process-manager to fail during startup.
