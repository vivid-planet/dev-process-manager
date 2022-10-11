import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";
import { killProcess } from "./kill-process";

export async function stopDaemonCommand(daemon: Daemon, socket: Socket, scriptName: string): Promise<void> {
    const { scripts } = daemon;
    const script = scripts.find((i) => i.name == scriptName);
    if (!script) {
        console.log(`unknown script name ${scriptName}`);
        socket.write(`unknown script name ${scriptName}\n`);
        socket.end();
        return;
    }

    daemon.scriptStatus[script.name] = "stopped";
    await killProcess(daemon, socket, scriptName);

    socket.end();
}
