import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";
import { scriptsMatchingPattern } from "./scripts-matching-pattern";

export async function stopDaemonCommand(daemon: Daemon, socket: Socket, names: string[]): Promise<void> {
    const scriptsToProcess = scriptsMatchingPattern(daemon, names);
    if (!scriptsToProcess.length) {
        socket.write("No matching scripts found in dev-pm config");
        socket.end();
        return;
    }

    await Promise.all(
        scriptsToProcess.map((script) => {
            return script.killProcess(socket);
        }),
    );

    socket.end();
}
