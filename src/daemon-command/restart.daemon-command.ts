import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command.js";
import { handleLogSocketClose } from "./handle-log-socket-close.js";
import { scriptsMatchingPattern, ScriptsMatchingPatternOptions } from "./scripts-matching-pattern.js";

export interface RestartCommandOptions extends ScriptsMatchingPatternOptions {
    follow: boolean;
}
export async function restartDaemonCommand(daemon: Daemon, socket: Socket, options: RestartCommandOptions): Promise<void> {
    const scriptsToProcess = scriptsMatchingPattern(daemon, { patterns: options.patterns });
    if (!scriptsToProcess.length) {
        socket.write("No matching scripts found in dev-pm config\n");
        socket.end();
        return;
    }

    for (const script of scriptsToProcess) {
        await script.killProcess(socket);

        console.log(`starting ${script.name}`);
        socket.write(`starting ${script.name}\n`);
        script.startProcess(); //don't await

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
