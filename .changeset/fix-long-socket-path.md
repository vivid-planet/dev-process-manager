---
"dev-process-manager": patch
---

Fix daemon socket failing with `EINVAL` when the project path is long

Unix domain socket paths must fit into `sockaddr_un.sun_path` (108 bytes on Linux, 104 bytes on macOS). In deeply nested projects the path to `.pm.sock` exceeded that limit, so starting the daemon or connecting to it failed. The socket is now opened relative to its directory when the absolute path is too long.
