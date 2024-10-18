---
"@comet/dev-process-manager": minor
---

Don't inject .env file as real env variables for child processes

This can cause problems when the child process has a custom .env loading mechanism (eg. additional files such as .env.secrets) but dev-pm sets env vars which overrule the values loaded from .env by child child process
