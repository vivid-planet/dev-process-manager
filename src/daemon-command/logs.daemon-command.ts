import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";
import { scriptsMatchingPattern } from "./scripts-matching-pattern";

export function logsDaemonCommand(daemon: Daemon, socket: Socket, scriptName: string | null /* null means all */): void {
    const scriptsToProcess = scriptsMatchingPattern(daemon, scriptName);

    for (const script of scriptsToProcess) {
        for (const line of script.logBuffer) {
            socket.write(`${script.name}: ${line}\n`);
        }

        script.logSockets.push(socket);
        socket.on("close", () => {
            const index = script.logSockets.findIndex((i) => i == socket);
            if (index !== -1) {
                script.logSockets.splice(index, 1);
            }
        });
    }
}
