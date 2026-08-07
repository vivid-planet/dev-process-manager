---
id: agent-skills
title: AI Agent Skills
sidebar_label: AI Agent Skills
---

# AI Agent Skills

dev-process-manager ships an **[Agent Skill](https://agentskills.io/)** that teaches AI
coding agents (Claude Code, Cursor, GitHub Copilot, …) how to drive `dev-pm` correctly —
starting, stopping and restarting processes, reading `status`, and tailing `logs` without
hanging the agent on streaming flags.

The skill is bundled inside the npm package under a `skills/` directory:

```
dev-process-manager/
└── skills/
    └── dev-pm/
        └── SKILL.md
```

Because it lives in the package itself, any project that has dev-process-manager as a
direct dependency can install the skill straight from `node_modules` — no separate
download needed.

## Installing the skill

Pick whichever installer your project already uses. Both discover the `skills/` folder
inside `node_modules/dev-process-manager` automatically and wire it into the directories
agents read from (`.claude/skills/`, `.agents/skills/`, …).

### Option A — skills-npm

[`skills-npm`](https://github.com/antfu/skills-npm) is a generic installer that symlinks
skills shipped by your dependencies into your project. Run the one-time setup:

```bash
npx skills-npm setup
```

This adds a `prepare` script and a `.gitignore` entry, then syncs once. From then on the
`dev-pm` skill is re-linked automatically whenever dependencies are installed.

### Option B — @comet/cli

If your project uses Comet, `@comet/cli` provides the same functionality via
`install-agent-features`, which scans your direct `node_modules` dependencies for
`skills/` folders and installs what it finds:

```bash
npx @comet/cli install-agent-features
```

## What the agent learns

Once installed, the agent picks the skill up automatically and follows its guidance to:

- Invoke `dev-pm` through the package manager (`npm exec -- dev-pm <command>`).
- Avoid streaming flags (`--follow`, `--interval`, `logs` without `-n`) that would hang a
  tool call.
- Check `status` before starting processes, since the daemon persists across sessions.
- Read `dev-pm.config.ts` to discover the available scripts and groups.

The directories the installer writes to (`.claude/skills/`, `.agents/skills/`, …) are
generated on install and should not be committed — add them to your `.gitignore`.
