import CLITable from "cli-table3";
import colors from "colors";
import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";
import { scriptsMatchingPattern } from "./scripts-matching-pattern";

export function statusDaemonCommand(daemon: Daemon, socket: Socket, scriptName: string | null /* null means all */): void {
    const { processes } = daemon;
    const scriptsToProcess = scriptsMatchingPattern(daemon, scriptName);

    const response = scriptsToProcess.map((script) => {
        const process = processes[script.name];
        return {
            name: script.name,
            running: process ? !process.killed : false,
            pid: process && !process.killed ? process.pid : undefined,
        };
    });

    const table = new CLITable({
        head: [colors.blue.bold("Script"), colors.blue.bold("Status"), colors.bold.blue("PID")],
        colWidths: [100, 20, 20],
        style: { compact: true },
    });
    response.forEach((item) => {
        table.push([item.name, item.running ? colors.green("Running") : colors.red("Stopped"), item.pid?.toString()]);
    });
    socket.write(table.toString());
    socket.end();
}
