import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";
import { scriptsMatchingPattern } from "./scripts-matching-pattern";
import { startProcess } from "./start-process";

export async function startDaemonCommand(daemon: Daemon, socket: Socket, scriptName: string | null /* null means all */): Promise<void> {
    const scriptsToProcess = scriptsMatchingPattern(daemon, scriptName);

    for (const script of scriptsToProcess) {
        const process = daemon.processes[script.name];
        if (process && !process.killed) {
            socket.write(`already running: ${script.name}\n`);
        } else {
            socket.write(`starting ${script.name}...\n`);
            startProcess(daemon, script);
        }
    }

    socket.end();
}
