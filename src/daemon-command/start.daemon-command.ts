import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";
import { handleLogSocketClose } from "./handle-log-socket-close";
import { scriptsMatchingPattern, ScriptsMatchingPatternOptions } from "./scripts-matching-pattern";

export interface StartCommandOptions extends ScriptsMatchingPatternOptions {
    follow: boolean;
}
export async function startDaemonCommand(daemon: Daemon, socket: Socket, options: StartCommandOptions): Promise<void> {
    const scriptsToProcess = scriptsMatchingPattern(daemon, { patterns: options.patterns });
    if (!scriptsToProcess.length) {
        socket.write("No matching scripts found in dev-pm config");
        socket.end();
        return;
    }

    for (const script of scriptsToProcess) {
        if (script.status == "started") {
            socket.write(`already running: ${script.name}\n`);
        } else if (script.status == "waiting") {
            socket.write(`already waiting: ${script.name}\n`);
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
    } else {
        socket.on("close", () => {
            handleLogSocketClose(daemon, socket);
        });
    }
}
