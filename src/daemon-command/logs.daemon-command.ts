import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";
import { handleLogSocketClose } from "./handle-log-socket-close";
import { scriptsMatchingPattern } from "./scripts-matching-pattern";

export function logsDaemonCommand(daemon: Daemon, socket: Socket, names: string[]): void {
    const scriptsToProcess = scriptsMatchingPattern(daemon, names);
    if (!scriptsToProcess.length) {
        socket.write("No matching scripts found in dev-pm config");
        socket.end();
        return;
    }

    for (const script of scriptsToProcess) {
        for (const line of script.logBuffer) {
            socket.write(`${script.logPrefix}${line}\n`);
        }
        script.addLogSocket(socket);
    }

    socket.on("close", () => {
        handleLogSocketClose(daemon, socket);
    });
}
