import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";
import { startProcess } from "./start-process";

export async function restartDaemonCommand(daemon: Daemon, socket: Socket, scriptName: string): Promise<void> {
    const { scripts, processes } = daemon;
    const script = scripts.find((i) => i.name == scriptName);
    if (!script) {
        console.log(`unknown script name ${scriptName}`);
        socket.write(`unknown script name ${scriptName}\n`);
        socket.end();
        return;
    }

    const process = processes[scriptName];
    if (process) {
        if (!process.killed) {
            console.log(`killing ${scriptName}`);
            socket.write(`killing ${scriptName}`);
            process.kill("SIGINT");
            while (!process.killed) {
                console.log(`waiting for killed`);
                socket.write(`waiting for killed\n`);
                await new Promise((r) => setTimeout(r, 100));
            }
        }
    }

    console.log(`killing ${scriptName}`);
    socket.write(`starting ${scriptName}\n`);
    startProcess(daemon, script);
    socket.end();
}
