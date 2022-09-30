import colors from "colors";
import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";
import { killProcess } from "./kill-process";

export const shutdown = async (daemon: Daemon, socket?: Socket): Promise<void> => {
    console.log(`${colors.bgGreen.bold.black(" dev-pm ")} shutting down`);

    await Promise.all(
        daemon.scripts.map((script) => {
            daemon.scriptStatus[script.name] = "stopped";
            killProcess(daemon, socket, script.name);
        }),
    );

    daemon.server?.close();
    process.exit();
};
