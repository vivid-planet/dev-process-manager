import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";
import { killProcess } from "./kill-process";
import { scriptsMatchingPattern } from "./scripts-matching-pattern";
import { startProcess } from "./start-process";

export async function restartDaemonCommand(daemon: Daemon, socket: Socket, scriptName: string | null /* null means all */): Promise<void> {
    const scriptsToProcess = scriptsMatchingPattern(daemon, scriptName);

    for (const script of scriptsToProcess) {
        daemon.scriptStatus[script.name] = "stopping";
        await killProcess(daemon, socket, script.name);

        console.log(`starting ${script.name}`);
        socket.write(`starting ${script.name}\n`);
        startProcess(daemon, script);
    }

    socket.end();
}
