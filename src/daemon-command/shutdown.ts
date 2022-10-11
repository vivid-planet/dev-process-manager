import colors from "colors";
import { Daemon } from "src/commands/start.command";

export const shutdown = async (daemon: Daemon): Promise<void> => {
    console.log(`${colors.bgGreen.bold.black(" dev-pm ")} shutting down`);
    daemon.shuttingDown = true;
    await Promise.all(
        Object.values(daemon.processes).map(async (p) => {
            if (p.pid) {
                process.kill(-p.pid);
            }
        }),
    );
    daemon.server?.close();
    process.exit();
};
