---
"@comet/dev-process-manager": minor
---

Watch dev-pm.config.js and update in running daemon

This allows modifications without having to shutdown the deamon.
- processes are not restarted if the script command changes
- processes are stopped if the script is removed
- processes are not started if a new script is added
- identifier for updates is the name of a script
