import CLITable from "cli-table3";
import colors from "colors";
import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";
import { scriptsMatchingPattern } from "./scripts-matching-pattern";

export function statusDaemonCommand(daemon: Daemon, socket: Socket, names: string[]): void {
    const scriptsToProcess = scriptsMatchingPattern(daemon, names);
    if (!scriptsToProcess.length) {
        socket.write("No matching scripts found in dev-pm config");
        socket.end();
        return;
    }

    const table = new CLITable({
        head: [colors.blue.bold("Script"), colors.blue.bold("Status"), colors.bold.blue("PID")],
        colWidths: [100, 20, 20],
        style: { compact: true },
    });
    scriptsToProcess.forEach((script) => {
        const running = script.process ? !script.process.killed : false;
        const status = script.status === "waiting" ? colors.yellow("Waiting") : running ? colors.green("Running") : colors.red("Stopped");
        const pid = script.process && !script.process.killed ? script.process.pid : undefined;
        table.push([script.name, status, pid?.toString()]);
    });
    socket.write(table.toString());
    socket.end();
}
