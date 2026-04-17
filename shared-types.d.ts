// Shared type definitions used by both the dev-pm package and the vscode-extension.
// This file is intentionally a .d.ts so it can be imported from packages with a
// restricted rootDir (like the vscode-extension) without emitting JS output.

export type ScriptStatus = "started" | "stopping" | "stopped" | "waiting" | "backoff";

export interface ScriptStatusEntry {
    id: number;
    name: string;
    status: ScriptStatus;
    cpu: string;
    memory: string;
    pid: number | undefined;
    restarts: number;
}
