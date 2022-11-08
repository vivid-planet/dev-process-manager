import colors from "colors";
import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";

export const shutdown = async (daemon: Daemon, socket?: Socket): Promise<void> => {
    console.log(`${colors.bgGreen.bold.black(" dev-pm ")} shutting down`);

    await Promise.all(
        daemon.scripts.map((script) => {
            return script.killProcess(socket);
        }),
    );

    daemon.server?.close();
    process.exit();
};
