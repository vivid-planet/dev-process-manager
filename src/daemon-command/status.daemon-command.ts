import { execFile } from "child_process";
import CLITable from "cli-table3";
import colors from "colors";
import { create as createLogUpdate } from "log-update";
import { type Socket } from "net";
import pidtree from "pidtree";
import pidusage from "pidusage";
import prettyBytes from "pretty-bytes";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

import { type Daemon } from "../commands/start-daemon.command.js";
import { type ScriptStatus } from "./script.js";
import { scriptsMatchingPattern, type ScriptsMatchingPatternOptions } from "./scripts-matching-pattern.js";

export interface StatusCommandOptions extends ScriptsMatchingPatternOptions {
    interval: number | undefined;
}

const statusTexts: { [status in ScriptStatus]: string } = {
    started: colors.green("Started"),
    stopping: colors.red("Stopping"),
    stopped: "Stopped",
    waiting: colors.yellow("Waiting"),
    backoff: colors.red("Backoff"),
};

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

async function listeningPortsRecursive(pid: number): Promise<number[]> {
    const pids = await pidtree(pid, { root: true });
    try {
        // lsof exits with code 1 when no matching files are found, so don't throw on non-zero exit
        const { stdout } = await execFileAsync("lsof", ["-nP", "-iTCP", "-sTCP:LISTEN", "-a", "-p", pids.join(","), "-Fn"]).catch(
            (err: { stdout?: string }) => ({ stdout: err.stdout ?? "" }),
        );
        const ports = new Set<number>();
        for (const line of stdout.split("\n")) {
            // -Fn produces lines like "n*:3000" or "n127.0.0.1:3000"
            if (!line.startsWith("n")) continue;
            const match = line.match(/:(\d+)$/);
            if (match) ports.add(Number(match[1]));
        }
        return [...ports].sort((a, b) => a - b);
    } catch {
        return [];
    }
}

export async function statusDaemonCommand(daemon: Daemon, socket: Socket, options: StatusCommandOptions): Promise<void> {
    const scriptsToProcess = scriptsMatchingPattern(daemon, { patterns: options.patterns });
    if (!scriptsToProcess.length) {
        socket.write("No matching scripts found in dev-pm config\n");
        socket.end();
        return;
    }

    //log-update reads rows/columns from terminal, but in our case it's a socket that doesn't contain those
    //inject a high enough number so will refresh more rows and don't wrap too early
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    socket.rows = 1000;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    socket.columns = 200;

    const logUpdate = createLogUpdate(socket);

    do {
        const table = new CLITable({
            head: [
                colors.blue.bold("ID"),
                colors.blue.bold("Script"),
                colors.blue.bold("Status"),
                colors.blue.bold("CPU"),
                colors.blue.bold("Mem"),
                colors.bold.blue("PID"),
                colors.bold.blue("Ports"),
                colors.bold.blue("Restarts"),
            ],
            style: { compact: true },
        });
        for (const script of scriptsToProcess) {
            const pid = script.process?.pid;
            let status = statusTexts[script.status];
            if (script.status == "started") {
                if (pid) {
                    status = colors.green("Running");
                }
            }

            let cpu = "";
            let memory = "";
            let ports = "";
            if (pid && script.status == "started") {
                try {
                    const stats = await pidusageRecursive(pid);
                    cpu = `${Math.round(stats.cpu)}%`;
                    memory = prettyBytes(stats.memory);
                } catch {
                    //
                }
                ports = (await listeningPortsRecursive(pid)).join(", ");
            }
            table.push([script.id, script.name, status, cpu, memory, pid?.toString(), ports, script.restartCount]);
        }

        if (!socket.writable) break;
        logUpdate(table.toString());
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
