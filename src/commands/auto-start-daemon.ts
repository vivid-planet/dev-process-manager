import { spawn } from "child_process";
import { existsSync, unlinkSync } from "fs";
import { createConnection } from "net";

import { chdirToProjectRoot, loadConfig } from "../utils/load-config.js";

function isDaemonRunning(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            client.destroy();
            resolve(false);
        }, 5000);
        const client = createConnection(`.pm.sock`);
        client.on("connect", () => {
            clearTimeout(timeout);
            client.destroy();
            resolve(true);
        });
        client.on("error", (error: NodeJS.ErrnoException) => {
            clearTimeout(timeout);
            client.destroy();
            if (error.code === "ECONNREFUSED") {
                resolve(false);
            }
            reject(error);
        });
    });
}

export async function autoStartDaemon(): Promise<void> {
    const { sources } = await loadConfig();
    chdirToProjectRoot(sources[0]);
    if (existsSync(`.pm.sock`)) {
        if (await isDaemonRunning()) {
            // daemon is running
            return;
        }
        // socket file exists but daemon is not running, remove stale socket file
        unlinkSync(`.pm.sock`);
    }
    console.log("starting dev-pm daemon...");
    const child = spawn(process.argv[0], [process.argv[1], "start-daemon"], { detached: true, stdio: ["ignore", "ignore", "ignore"] });
    child.unref();
    while (!existsSync(`.pm.sock`)) {
        await new Promise((r) => setTimeout(r, 100));
    }
}
