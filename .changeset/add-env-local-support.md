---
"@comet/dev-process-manager": minor
---

Add support for `.env.local` file

Variables defined in `.env.local` override those in `.env`, following the common convention where `.env` holds shared defaults and `.env.local` holds machine-local overrides (typically added to `.gitignore`).
