import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";

export function handleLogSocketClose(daemon: Daemon, socket: Socket): void {
    for (const script of daemon.scripts) {
        const index = script.logSockets.findIndex((i) => i == socket);
        if (index !== -1) {
            script.logSockets.splice(index, 1);
        }
    }
}
