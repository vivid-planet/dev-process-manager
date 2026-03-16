import { spawn } from "child_process";
import { existsSync, unlinkSync } from "fs";
import { dirname } from "path";

import { isDaemonRunning } from "../utils/is-daemon-running.js";
import { loadConfig } from "../utils/load-config.js";

export async function autoStartDaemon(): Promise<void> {
    const { sources } = await loadConfig();
    const socketPath = `${dirname(sources[0])}/.pm.sock`;
    if (existsSync(socketPath)) {
        if (await isDaemonRunning(socketPath)) {
            // daemon is running
            return;
        }
        // socket file exists but daemon is not running, remove stale socket file
        unlinkSync(socketPath);
    }
    console.log("starting dev-pm daemon...");
    const child = spawn(process.argv[0], [process.argv[1], "start-daemon"], { detached: true, stdio: ["ignore", "ignore", "ignore"] });
    child.unref();
    while (!existsSync(socketPath)) {
        await new Promise((r) => setTimeout(r, 100));
    }
}
