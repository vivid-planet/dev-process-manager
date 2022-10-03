import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";
import { scriptsMatchingPattern } from "./scripts-matching-pattern";

export async function startDaemonCommand(daemon: Daemon, socket: Socket, names: string[]): Promise<void> {
    const scriptsToProcess = scriptsMatchingPattern(daemon, names);

    for (const script of scriptsToProcess) {
        if (script.process && !script.process.killed) {
            socket.write(`already running: ${script.name}\n`);
        } else {
            socket.write(`starting ${script.name}...\n`);
            script.startProcess();
        }
    }

    socket.end();
}
