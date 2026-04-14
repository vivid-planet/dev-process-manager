import * as vscode from "vscode";

import {
    isDaemonRunning,
    parseStatusOutput,
    type ScriptStatusEntry,
    sendCommand,
} from "./daemon-client";

type ScriptStatus = "running" | "stopped" | "waiting" | "stopping" | "backoff" | "unknown";

function normalizeStatus(rawStatus: string): ScriptStatus {
    const s = rawStatus.toLowerCase().trim();
    if (s === "running" || s === "started") {
        return "running";
    }
    if (s === "stopped") {
        return "stopped";
    }
    if (s === "waiting") {
        return "waiting";
    }
    if (s === "stopping") {
        return "stopping";
    }
    if (s === "backoff") {
        return "backoff";
    }
    return "unknown";
}

function getStatusIcon(status: ScriptStatus): vscode.ThemeIcon {
    switch (status) {
        case "running":
            return new vscode.ThemeIcon("play-circle", new vscode.ThemeColor("testing.iconPassed"));
        case "stopped":
            return new vscode.ThemeIcon("circle-outline", new vscode.ThemeColor("disabledForeground"));
        case "waiting":
            return new vscode.ThemeIcon("loading~spin", new vscode.ThemeColor("notificationsWarningIcon.foreground"));
        case "stopping":
            return new vscode.ThemeIcon("loading~spin", new vscode.ThemeColor("notificationsErrorIcon.foreground"));
        case "backoff":
            return new vscode.ThemeIcon("warning", new vscode.ThemeColor("notificationsErrorIcon.foreground"));
        default:
            return new vscode.ThemeIcon("question");
    }
}

export class ScriptTreeItem extends vscode.TreeItem {
    constructor(
        public readonly entry: ScriptStatusEntry,
    ) {
        super(entry.name, vscode.TreeItemCollapsibleState.None);

        const status = normalizeStatus(entry.status);

        // Map to daemon's original status for context value (used in when clauses for menus)
        // The daemon uses "started" for running scripts
        const contextStatus = status === "running" ? "started" : status;
        this.contextValue = contextStatus;

        this.iconPath = getStatusIcon(status);

        const details: string[] = [];
        if (status === "running") {
            details.push("Running");
            if (entry.pid) {
                details.push(`PID: ${entry.pid}`);
            }
            if (entry.cpu) {
                details.push(`CPU: ${entry.cpu}`);
            }
            if (entry.memory) {
                details.push(`Mem: ${entry.memory}`);
            }
        } else {
            details.push(status.charAt(0).toUpperCase() + status.slice(1));
        }

        if (entry.restarts && entry.restarts !== "0") {
            details.push(`Restarts: ${entry.restarts}`);
        }

        this.description = details.join(" · ");
        this.tooltip = new vscode.MarkdownString(
            [
                `**${entry.name}** (ID: ${entry.id})`,
                "",
                `- **Status:** ${status}`,
                entry.pid ? `- **PID:** ${entry.pid}` : "",
                entry.cpu ? `- **CPU:** ${entry.cpu}` : "",
                entry.memory ? `- **Memory:** ${entry.memory}` : "",
                `- **Restarts:** ${entry.restarts}`,
            ]
                .filter(Boolean)
                .join("\n"),
        );
    }
}

export class ScriptsTreeDataProvider implements vscode.TreeDataProvider<ScriptTreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<ScriptTreeItem | undefined | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private entries: ScriptStatusEntry[] = [];
    private refreshTimer: ReturnType<typeof setInterval> | undefined;
    private socketPath: string | undefined;

    setSocketPath(socketPath: string): void {
        this.socketPath = socketPath;
    }

    startAutoRefresh(intervalMs: number = 2000): void {
        this.stopAutoRefresh();
        this.refreshTimer = setInterval(() => {
            this.refresh();
        }, intervalMs);
    }

    stopAutoRefresh(): void {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = undefined;
        }
    }

    async refresh(): Promise<void> {
        if (!this.socketPath) {
            this.entries = [];
            this._onDidChangeTreeData.fire();
            return;
        }

        const running = await isDaemonRunning(this.socketPath);
        if (!running) {
            this.entries = [];
            this._onDidChangeTreeData.fire();
            return;
        }

        try {
            const output = await sendCommand(
                this.socketPath,
                `status ${JSON.stringify({ patterns: [], interval: undefined })}`,
            );
            this.entries = parseStatusOutput(output);
        } catch {
            this.entries = [];
        }

        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ScriptTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ScriptTreeItem): ScriptTreeItem[] {
        if (element) {
            return [];
        }
        return this.entries.map((entry) => new ScriptTreeItem(entry));
    }

    dispose(): void {
        this.stopAutoRefresh();
        this._onDidChangeTreeData.dispose();
    }
}
