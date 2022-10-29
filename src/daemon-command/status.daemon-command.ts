import CLITable from "cli-table3";
import colors from "colors";
import { Socket } from "net";
import pidusage from "pidusage";
import prettyBytes from "pretty-bytes";

import { Daemon } from "../commands/start-daemon.command";
import { scriptsMatchingPattern } from "./scripts-matching-pattern";

export async function statusDaemonCommand(daemon: Daemon, socket: Socket, names: string[]): Promise<void> {
    const scriptsToProcess = scriptsMatchingPattern(daemon, names);
    if (!scriptsToProcess.length) {
        socket.write("No matching scripts found in dev-pm config");
        socket.end();
        return;
    }

    const table = new CLITable({
        head: [colors.blue.bold("Script"), colors.blue.bold("Status"), colors.blue.bold("CPU"), colors.blue.bold("Mem"), colors.bold.blue("PID")],
        style: { compact: true },
    });
    for (const script of scriptsToProcess) {
        const running = script.process ? !script.process.killed : false;
        const status = script.status === "waiting" ? colors.yellow("Waiting") : running ? colors.green("Running") : colors.red("Stopped");
        const pid = script.process && !script.process.killed ? script.process.pid : undefined;
        let cpu = "";
        let memory = "";
        if (pid) {
            const stats = await pidusage(pid);
            cpu = `${stats.cpu}%`;
            memory = prettyBytes(stats.memory);
        }
        table.push([script.name, status, cpu, memory, pid?.toString()]);
    }
    socket.write(table.toString());
    socket.end();
}
