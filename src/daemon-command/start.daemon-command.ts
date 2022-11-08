import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";
import { scriptsMatchingPattern } from "./scripts-matching-pattern";

export interface StartCommandOptions {
    names: string[];
    follow: boolean;
}
export async function startDaemonCommand(daemon: Daemon, socket: Socket, options: StartCommandOptions): Promise<void> {
    const scriptsToProcess = scriptsMatchingPattern(daemon, options.names);
    if (!scriptsToProcess.length) {
        socket.write("No matching scripts found in dev-pm config");
        socket.end();
        return;
    }

    for (const script of scriptsToProcess) {
        if (script.process && !script.process.killed) {
            socket.write(`already running: ${script.name}\n`);
        } else {
            socket.write(`starting ${script.name}...\n`);
            script.startProcess(); //don't await
        }
        if (options.follow) {
            script.addLogSocket(socket);
        }
    }

    if (!options.follow) {
        socket.end();
    }
}
