import CLITable from "cli-table3";
import colors from "colors";
import { Socket } from "net";
import { Daemon } from "src/commands/start.command";

export function statusDaemonCommand({ processes }: Daemon, socket: Socket): void {
    const response = Object.keys(processes).map((name) => {
        const p = processes[name];
        return {
            name,
            running: !p.killed,
            pid: p.pid,
        };
    });

    const table = new CLITable({
        head: [colors.blue.bold("Script"), colors.blue.bold("Status"), colors.bold.blue("PID")],
        colWidths: [100, 20, 20],
    });
    response.forEach((item) => {
        table.push([item.name, item.running ? colors.green("Running") : colors.red("Stopped"), item.pid?.toString()]);
    });
    socket.write(table.toString());
    socket.end();
}
