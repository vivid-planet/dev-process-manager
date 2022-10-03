import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";
import { scriptsMatchingPattern } from "./scripts-matching-pattern";

export async function restartDaemonCommand(daemon: Daemon, socket: Socket, names: string[]): Promise<void> {
    const scriptsToProcess = scriptsMatchingPattern(daemon, names);

    for (const script of scriptsToProcess) {
        script.status = "stopping";
        await script.killProcess(socket);

        console.log(`starting ${script.name}`);
        socket.write(`starting ${script.name}\n`);
        script.startProcess();
    }

    socket.end();
}
