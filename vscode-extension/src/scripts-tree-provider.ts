import * as vscode from "vscode";

import {
    isDaemonRunning,
    parseStatusOutput,
    sendCommand,
} from "./daemon-client";
import { ScriptStatus, ScriptStatusEntry } from "../../shared-types";

function getStatusIcon(status: ScriptStatus): vscode.ThemeIcon {
    switch (status) {
        case "started":
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

        const status = entry.status;

        this.contextValue = status;

        this.iconPath = getStatusIcon(status);

        const details: string[] = [];
        if (status !== "started" && status !== "stopped") {
            details.push(status.charAt(0).toUpperCase() + status.slice(1));
        }

        if (entry.restarts > 0) {
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

    private _onDaemonLost = new vscode.EventEmitter<void>();
    readonly onDaemonLost = this._onDaemonLost.event;

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
        let newEntries: ScriptStatusEntry[];

        if (!this.socketPath) {
            newEntries = [];
        } else if (!(await isDaemonRunning(this.socketPath))) {
            newEntries = [];
            this.stopAutoRefresh();
            this._onDaemonLost.fire();
        } else {
            try {
                const output = await sendCommand(
                    this.socketPath,
                    `status ${JSON.stringify({ patterns: [], interval: undefined })}`,
                );
                newEntries = parseStatusOutput(output);
            } catch {
                newEntries = [];
            }
        }

        const changed = !this.entriesEqual(this.entries, newEntries);
        this.entries = newEntries;
        if (changed) {
            this._onDidChangeTreeData.fire();
        }
    }

    private entriesEqual(a: ScriptStatusEntry[], b: ScriptStatusEntry[]): boolean {
        if (a.length !== b.length) {
            return false;
        }
        return a.every(
            (e, i) =>
                e.id === b[i].id &&
                e.name === b[i].name &&
                e.status === b[i].status &&
                e.restarts === b[i].restarts,
        );
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
        this._onDaemonLost.dispose();
    }
}
