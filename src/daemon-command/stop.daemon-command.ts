import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";
import { killProcess } from "./kill-process";
import { scriptsMatchingPattern } from "./scripts-matching-pattern";

export async function stopDaemonCommand(daemon: Daemon, socket: Socket, scriptName: string | null /* null means all */): Promise<void> {
    const scriptsToProcess = scriptsMatchingPattern(daemon, scriptName);

    for (const script of scriptsToProcess) {
        daemon.scriptStatus[script.name] = "stopped";
        await killProcess(daemon, socket, script.name);
    }

    socket.end();
}
