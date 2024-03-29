import CLITable from "cli-table3";
import colors from "colors";
import { create as createLogUpdate } from "log-update";
import { Socket } from "net";
import pidtree from "pidtree";
import pidusage from "pidusage";
import prettyBytes from "pretty-bytes";

import { Daemon } from "../commands/start-daemon.command";
import { ScriptStatus } from "./script";
import { scriptsMatchingPattern, ScriptsMatchingPatternOptions } from "./scripts-matching-pattern";

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

export async function statusDaemonCommand(daemon: Daemon, socket: Socket, options: StatusCommandOptions): Promise<void> {
    const scriptsToProcess = scriptsMatchingPattern(daemon, { patterns: options.patterns });
    if (!scriptsToProcess.length) {
        socket.write("No matching scripts found in dev-pm config");
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
            if (pid && script.status == "started") {
                try {
                    const stats = await pidusageRecursive(pid);
                    cpu = `${Math.round(stats.cpu)}%`;
                    memory = prettyBytes(stats.memory);
                } catch {
                    //
                }
            }
            table.push([script.id, script.name, status, cpu, memory, pid?.toString(), script.restartCount]);
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
