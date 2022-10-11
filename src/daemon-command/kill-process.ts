import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";

export async function killProcess(daemon: Daemon, socket: Socket | undefined, scriptName: string): Promise<void> {
    const childProcess = daemon.processes[scriptName];
    if (childProcess && !childProcess.killed) {
        console.log(`killing ${scriptName}`);
        socket?.write(`killing ${scriptName}\n`);
        process.kill(-childProcess.pid);
        while (daemon.scriptStatus[scriptName] != "stopped") {
            console.log(`waiting for killed`);
            socket?.write(`waiting for killed\n`);
            await new Promise((r) => setTimeout(r, 100));
        }
    }
}
