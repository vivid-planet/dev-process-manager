import { type Socket } from "net";
import pidtree from "pidtree";
import pidusage from "pidusage";
import prettyBytes from "pretty-bytes";

import type { ScriptStatusEntry } from "../../shared-types.js";
import { type Daemon } from "../commands/start-daemon.command.js";
import { scriptsMatchingPattern, type ScriptsMatchingPatternOptions } from "./scripts-matching-pattern.js";

export type { ScriptStatusEntry };

export interface StatusCommandOptions extends ScriptsMatchingPatternOptions {
    interval: number | undefined;
}

async function pidusageRecursive(pid: number): Promise<{ cpu: number; memory: number }> {
    const pids = await pidtree(pid, { root: true });
    const usages = await pidusage(pids);
    return Object.values(usages).reduce(
        (acc, value) => {
            acc.cpu += value.cpu;
            acc.memory += value.memory;
            return acc;
        },
        { cpu: 0, memory: 0 },
    );
}

async function getScriptEntries(daemon: Daemon, patterns: string[]): Promise<ScriptStatusEntry[]> {
    const scriptsToProcess = scriptsMatchingPattern(daemon, { patterns });
    const entries: ScriptStatusEntry[] = [];
    for (const script of scriptsToProcess) {
        const pid = script.process?.pid;
        let cpu = "";
        let memory = "";
        if (pid && script.status == "started") {
            try {
                const stats = await pidusageRecursive(pid);
                cpu = `${Math.round(stats.cpu)}%`;
                memory = prettyBytes(stats.memory);
            } catch {
                //
            }
        }
        entries.push({
            id: script.id,
            name: script.name,
            status: script.status,
            cpu,
            memory,
            pid,
            restarts: script.restartCount,
        });
    }
    return entries;
}

export async function statusDaemonCommand(daemon: Daemon, socket: Socket, options: StatusCommandOptions): Promise<void> {
    const scriptsToProcess = scriptsMatchingPattern(daemon, { patterns: options.patterns });
    if (!scriptsToProcess.length) {
        socket.write(`${JSON.stringify({ error: "No matching scripts found in dev-pm config" })}\n`);
        socket.end();
        return;
    }

    do {
        const entries = await getScriptEntries(daemon, options.patterns);
        if (!socket.writable) break;
        socket.write(`${JSON.stringify(entries)}\n`);
        if (options.interval) {
            await delay(options.interval * 1000);
        }
    } while (options.interval);

    socket.end();
}

function delay(t: number): Promise<void> {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, t);
    });
}
