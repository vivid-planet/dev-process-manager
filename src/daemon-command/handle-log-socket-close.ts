import { type Socket } from "net";

import { type Daemon } from "../commands/start-daemon.command.js";

export function handleLogSocketClose(daemon: Daemon, socket: Socket): void {
    for (const script of daemon.scripts) {
        const index = script.logSockets.findIndex((i) => i == socket);
        if (index !== -1) {
            script.logSockets.splice(index, 1);
        }
    }
}
