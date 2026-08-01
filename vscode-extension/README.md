# Dev Process Manager - VS Code Extension

A VS Code extension for [dev-process-manager](https://github.com/vivid-planet/dev-process-manager) that lets you manage your dev scripts directly from the VS Code sidebar.

## Features

- **Script Status Overview**: See all your dev-pm scripts and their current status (running, stopped, waiting, backoff) in the sidebar
- **Auto-Refresh**: The status list refreshes automatically every 2 seconds
- **Start/Stop/Restart**: Control individual scripts with inline action buttons
- **Start All / Stop All**: Bulk actions available in the view title bar
- **Live Logs**: Open a streaming log output channel for any script

## Requirements

- [VS Code](https://code.visualstudio.com/) 1.85.0 or later
- [dev-process-manager](https://www.npmjs.com/package/dev-process-manager) installed and configured in your project

## Usage

1. Open a workspace that contains a `dev-pm.config.*` file
2. Start the dev-pm daemon (e.g., `dev-pm start`)
3. The **Dev Process Manager** view will appear in the activity bar
4. Use the inline buttons to start, stop, restart, or view logs for each script

### Script Status Icons

| Icon | Status |
|------|--------|
| ▶ (green) | Running |
| ○ (grey) | Stopped |
| ⟳ (yellow) | Waiting (for dependencies) |
| ⟳ (red) | Stopping |
| ⚠ (red) | Backoff (crashed, restarting) |

### Actions

- **Start** (▶): Start a stopped script
- **Restart** (⟳): Restart a running or waiting script
- **Stop** (■): Stop a running or waiting script
- **Logs** (📋): Open a live log stream in a VS Code Output Channel

## Development

```bash
cd vscode-extension
npm install
npm run compile
```

To test the extension, press `F5` in VS Code to launch an Extension Development Host.

## Packaging

```bash
cd vscode-extension
npm run package
```

This creates a `.vsix` file that can be installed in VS Code.

## Publishing

The extension is published to the [VS Code Marketplace](https://marketplace.visualstudio.com/) by the
`Deploy VS Code Extension` GitHub Actions workflow (`.github/workflows/deploy-vscode-extension.yml`).

The workflow runs when a tag matching `vscode-extension-v<major>.<minor>.<patch>` is pushed, and can also be
triggered manually from the Actions tab (`workflow_dispatch`). It publishes the version currently set in
`vscode-extension/package.json`, so bump that version before tagging.

To cut a release:

```bash
# 1. Bump the version in vscode-extension/package.json (e.g. to 0.2.0) and commit it
# 2. Tag the release and push the tag
git tag vscode-extension-v0.2.0
git push origin vscode-extension-v0.2.0
```

Publishing requires a repository secret named `VSCE_PAT` containing an Azure DevOps Personal Access Token
for the `vivid-planet` publisher (see the [vsce docs](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token)).
