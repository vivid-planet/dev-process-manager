---
"@comet/dev-process-manager": minor
---

Don't fail when `.pm.sock` file exists but daemon is not running

Verify if the daemon is actually running by trying to connect to the socket. If no connection is possible, assume it is not running, remove the stale socket file, and start the daemon.
