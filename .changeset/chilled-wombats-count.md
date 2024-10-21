---
"@comet/dev-process-manager": minor
---

Don't inject .env file as real environment variables for child processes

This can cause problems when the child process has a custom .env loading mechanism (e.g., additional files such as .env.secrets), but dev-pm sets environment variables which overrule the values loaded by the child process.
