import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";
import { scriptsMatchingPattern } from "./scripts-matching-pattern";

export interface RestartCommandOptions {
    names: string[];
    follow: boolean;
}
export async function restartDaemonCommand(daemon: Daemon, socket: Socket, options: RestartCommandOptions): Promise<void> {
    const scriptsToProcess = scriptsMatchingPattern(daemon, options.names);
    if (!scriptsToProcess.length) {
        socket.write("No matching scripts found in dev-pm config");
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
    }
}
