import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";
import { startProcess } from "./start-process";

export async function startDaemonCommand(daemon: Daemon, socket: Socket, options: { only?: string[]; onlyGroup?: string[] }): Promise<void> {
    const scriptsToStart = daemon.scripts.filter((script) => {
        if (options?.only && options.only.length > 0) {
            if (!options.only.includes(script.name)) return false;
        }
        if (options?.onlyGroup && options.onlyGroup.length > 0) {
            const scriptGroups = Array.isArray(script.group) ? script.group : [script.group];
            return scriptGroups.some((g) => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return options.onlyGroup!.includes(g);
            });
        }
        return true;
    });

    scriptsToStart.forEach((script) => {
        socket.write(`starting ${script.name}...\n`);
        startProcess(daemon, script);
    });

    socket.end();
}
