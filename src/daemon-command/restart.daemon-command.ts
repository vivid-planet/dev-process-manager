import colors from "colors";
import { Socket } from "net";
import { Daemon } from "src/commands/start.command";

import { startProcess } from "./start-process";

export async function restartDaemonCommand(daemon: Daemon, socket: Socket, scriptName: string): Promise<void> {
    const { scripts, processes } = daemon;
    const p = processes[scriptName];
    if (!p) {
        console.log(`${colors.bgYellow.bold.black(" dev-pm ")} unknown script name  ${scriptName}`);
        socket.end();
        return;
    }

    if (!p.killed) {
        console.log(`${colors.bgYellow.bold.black(" dev-pm ")} killing ${scriptName}`);
        p.kill("SIGINT");
        while (!p.killed) {
            console.log(`${colors.bgYellow.bold.black(" dev-pm ")} waiting for killed`);
            await new Promise((r) => setTimeout(r, 100));
        }
    }

    const script = scripts.find((i) => i.name == scriptName);
    if (!script) {
        console.log(`${colors.bgYellow.bold.black(" dev-pm ")} unknown script name  ${scriptName}`);
        socket.end();
        return;
    }
    startProcess(daemon, script);
    socket.end();
}
