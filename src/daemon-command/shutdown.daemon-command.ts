import { type Socket } from "net";

import { type Daemon } from "../commands/start-daemon.command.js";
import { shutdown } from "./shutdown.js";

export function shutdownDaemonCommand(daemon: Daemon, socket: Socket): void {
    //    socket.destroy(); //probably too early, doesn't allow us to send output
    shutdown(daemon, socket);
}
