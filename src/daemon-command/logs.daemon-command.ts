import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";
import { scriptsMatchingPattern } from "./scripts-matching-pattern";

export function logsDaemonCommand(daemon: Daemon, socket: Socket, scriptName: string | null /* null means all */): void {
    const { logSockets } = daemon;
    const scriptsToProcess = scriptsMatchingPattern(daemon, scriptName);

    for (const script of scriptsToProcess) {
        logSockets.push({ socket, name: script.name });
        socket.on("close", () => {
            const index = logSockets.findIndex((i) => i.socket == socket);
            if (index !== -1) {
                logSockets.splice(index, 1);
            }
        });
    }
}
