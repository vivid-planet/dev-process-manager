import { existsSync } from "fs";
import * as path from "path";
import * as vscode from "vscode";

import { getDaemonVersion, isDaemonRunning, sendCommand, sendCommandStreaming, stripAnsi } from "./daemon-client";
import { type ScriptTreeItem, ScriptsTreeDataProvider } from "./scripts-tree-provider";

const MINIMUM_DAEMON_VERSION = "3.2.0";

let treeDataProvider: ScriptsTreeDataProvider | undefined;
let reconnectTimer: ReturnType<typeof setInterval> | undefined;
const logOutputChannels = new Map<string, vscode.OutputChannel>();
const activeLogConnections = new Map<string, { dispose: () => void }>();

function startReconnecting(socketPath: string, treeView: vscode.TreeView<ScriptTreeItem>): void {
    if (reconnectTimer) return;
    reconnectTimer = setInterval(() => {
        connectToDaemon(socketPath, treeView);
    }, 5000);
}

function stopReconnecting(): void {
    if (reconnectTimer) {
        clearInterval(reconnectTimer);
        reconnectTimer = undefined;
    }
}

/**
 * Find the `.pm.sock` socket file in the workspace.
 * Searches all workspace folder roots for a dev-pm config file and derives the socket path.
 */
function findSocketPath(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return undefined;
    }

    const configPatterns = [
        "dev-pm.config.ts",
        "dev-pm.config.mts",
        "dev-pm.config.cts",
        "dev-pm.config.js",
        "dev-pm.config.mjs",
        "dev-pm.config.cjs",
        "dev-pm.config.json",
    ];

    for (const folder of workspaceFolders) {
        // Check for socket directly
        const socketPath = path.join(folder.uri.fsPath, ".pm.sock");
        if (existsSync(socketPath)) {
            return socketPath;
        }

        // Check for config file (socket will be in same directory)
        for (const configFile of configPatterns) {
            const configPath = path.join(folder.uri.fsPath, configFile);
            if (existsSync(configPath)) {
                return socketPath;
            }
        }
    }

    return undefined;
}

function isVersionCompatible(version: string | undefined): boolean {
    if (!version) return false;
    const parts = version.split(".").map(Number);
    const minParts = MINIMUM_DAEMON_VERSION.split(".").map(Number);
    for (let i = 0; i < minParts.length; i++) {
        if ((parts[i] ?? 0) > minParts[i]) return true;
        if ((parts[i] ?? 0) < minParts[i]) return false;
    }
    return true;
}

async function connectToDaemon(socketPath: string, treeView: vscode.TreeView<ScriptTreeItem>): Promise<void> {
    if (!(await isDaemonRunning(socketPath))) {
        treeView.message = "Dev PM daemon is not running.";
        treeDataProvider!.stopAutoRefresh();
        startReconnecting(socketPath, treeView);
        return;
    }

    const version = await getDaemonVersion(socketPath);
    if (!isVersionCompatible(version)) {
        const actual = version ?? "unknown";
        treeView.message = `Daemon version ${actual} is not compatible. Minimum required: ${MINIMUM_DAEMON_VERSION}. Please update dev-process-manager and restart the daemon.`;
        treeDataProvider!.stopAutoRefresh();
        startReconnecting(socketPath, treeView);
        return;
    }

    stopReconnecting();
    treeView.message = undefined;
    treeDataProvider!.setSocketPath(socketPath);
    treeDataProvider!.startAutoRefresh();
    treeDataProvider!.refresh();
}

export function activate(context: vscode.ExtensionContext): void {
    treeDataProvider = new ScriptsTreeDataProvider();

    const treeView = vscode.window.createTreeView("devPmScripts", {
        treeDataProvider,
        showCollapseAll: false,
    });

    const socketPath = findSocketPath();
    if (socketPath) {
        connectToDaemon(socketPath, treeView);
    } else {
        treeView.message = "No dev-pm.config found in workspace.";
    }

    // When daemon goes down during auto-refresh polling, start reconnecting
    treeDataProvider.onDaemonLost(() => {
        const sp = findSocketPath();
        if (sp) {
            treeView.message = "Dev PM daemon is not running. Start it with: dev-pm start";
            startReconnecting(sp, treeView);
        }
    });

    // Watch for workspace changes to detect socket file
    const fileWatcher = vscode.workspace.createFileSystemWatcher("**/.pm.sock");
    fileWatcher.onDidCreate(() => {
        const newSocketPath = findSocketPath();
        if (newSocketPath && treeDataProvider) {
            connectToDaemon(newSocketPath, treeView);
        }
    });
    fileWatcher.onDidDelete(() => {
        if (treeDataProvider) {
            treeDataProvider.stopAutoRefresh();
            const sp = findSocketPath();
            if (sp) {
                connectToDaemon(sp, treeView);
            }
        }
    });

    // Register commands
    context.subscriptions.push(
        treeView,
        fileWatcher,
        treeDataProvider,

        vscode.commands.registerCommand("devPm.refreshScripts", () => {
            treeDataProvider?.refresh();
        }),

        vscode.commands.registerCommand("devPm.startScript", async (item: ScriptTreeItem) => {
            await executeScriptCommand("start", item);
        }),

        vscode.commands.registerCommand("devPm.stopScript", async (item: ScriptTreeItem) => {
            await executeScriptCommand("stop", item);
        }),

        vscode.commands.registerCommand("devPm.restartScript", async (item: ScriptTreeItem) => {
            await executeScriptCommand("restart", item);
        }),

        vscode.commands.registerCommand("devPm.showLogs", (item: ScriptTreeItem) => {
            openLogs(item);
        }),

        vscode.commands.registerCommand("devPm.startAll", async () => {
            await executeAllCommand("start");
        }),

        vscode.commands.registerCommand("devPm.stopAll", async () => {
            await executeAllCommand("stop");
        }),
    );
}

async function executeScriptCommand(
    action: "start" | "stop" | "restart",
    item: ScriptTreeItem,
): Promise<void> {
    const socketPath = findSocketPath();
    if (!socketPath) {
        vscode.window.showErrorMessage("Dev PM: No socket found. Is the daemon running?");
        return;
    }

    const scriptName = item.entry.name;

    try {
        let command: string;
        if (action === "stop") {
            command = `stop ${JSON.stringify({ patterns: [scriptName] })}`;
        } else {
            command = `${action} ${JSON.stringify({ patterns: [scriptName], follow: false })}`;
        }

        await sendCommand(socketPath, command);
        // Refresh the tree after the action completes
        treeDataProvider?.refresh();
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`Dev PM: Failed to ${action} "${scriptName}": ${message}`);
    }
}

async function executeAllCommand(action: "start" | "stop"): Promise<void> {
    const socketPath = findSocketPath();
    if (!socketPath) {
        vscode.window.showErrorMessage("Dev PM: No socket found. Is the daemon running?");
        return;
    }

    try {
        let command: string;
        if (action === "stop") {
            command = `stop ${JSON.stringify({ patterns: ["all"] })}`;
        } else {
            command = `start ${JSON.stringify({ patterns: ["all"], follow: false })}`;
        }

        await sendCommand(socketPath, command);
        treeDataProvider?.refresh();
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`Dev PM: Failed to ${action} all scripts: ${message}`);
    }
}

function openLogs(item: ScriptTreeItem): void {
    const socketPath = findSocketPath();
    if (!socketPath) {
        vscode.window.showErrorMessage("Dev PM: No socket found. Is the daemon running?");
        return;
    }

    const scriptName = item.entry.name;
    const channelKey = scriptName;

    // If there's an existing log connection, dispose it
    const existingConnection = activeLogConnections.get(channelKey);
    if (existingConnection) {
        existingConnection.dispose();
        activeLogConnections.delete(channelKey);
    }

    // Get or create output channel
    let outputChannel = logOutputChannels.get(channelKey);
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel(`Dev PM: ${scriptName}`);
        logOutputChannels.set(channelKey, outputChannel);
    }

    outputChannel.clear();
    outputChannel.show(true);

    // Stream logs (no lines = live streaming after buffer dump)
    const command = `logs ${JSON.stringify({ patterns: [scriptName] })}`;
    const connection = sendCommandStreaming(
        socketPath,
        command,
        (data) => {
            // Strip ANSI color codes for clean output
            const cleanData = stripAnsi(data);
            // Remove the script name prefix that the daemon adds (e.g., "script-name: ")
            const lines = cleanData.split("\n");
            for (const line of lines) {
                if (line.trim()) {
                    outputChannel!.appendLine(line);
                }
            }
        },
        () => {
            outputChannel!.appendLine("[Dev PM] Log stream ended");
            activeLogConnections.delete(channelKey);
        },
        (err) => {
            outputChannel!.appendLine(`[Dev PM] Log stream error: ${err.message}`);
            activeLogConnections.delete(channelKey);
        },
    );

    activeLogConnections.set(channelKey, connection);
}

export function deactivate(): void {
    stopReconnecting();

    // Clean up all log streaming connections
    for (const [, connection] of activeLogConnections) {
        connection.dispose();
    }
    activeLogConnections.clear();

    // Clean up output channels
    for (const [, channel] of logOutputChannels) {
        channel.dispose();
    }
    logOutputChannels.clear();

    treeDataProvider?.dispose();
}
