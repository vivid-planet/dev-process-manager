import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";
import { killProcess } from "./kill-process";
import { startProcess } from "./start-process";

export async function restartDaemonCommand(daemon: Daemon, socket: Socket, scriptName: string): Promise<void> {
    const { scripts } = daemon;
    const script = scripts.find((i) => i.name == scriptName);
    if (!script) {
        console.log(`unknown script name ${scriptName}`);
        socket.write(`unknown script name ${scriptName}\n`);
        socket.end();
        return;
    }

    await killProcess(daemon, socket, scriptName);

    console.log(`starting ${scriptName}`);
    socket.write(`starting ${scriptName}\n`);
    startProcess(daemon, script);

    socket.end();
}
