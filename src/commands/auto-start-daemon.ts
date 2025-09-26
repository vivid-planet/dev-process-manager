import { spawn } from "child_process";
import { existsSync } from "fs";
import { dirname } from "path";

import { loadConfig } from "../utils/load-config.js";

export async function autoStartDaemon(): Promise<void> {
    const { sources } = await loadConfig();
    if (existsSync(`${dirname(sources[0])}/.pm.sock`)) {
        // socket file already exists, we assume daemon is already running
        return;
    }
    console.log("starting dev-pm daemon...");
    const child = spawn(process.argv[0], [process.argv[1], "start-daemon"], { detached: true, stdio: ["ignore", "ignore", "ignore"] });
    child.unref();
    while (!existsSync(`${dirname(sources[0])}/.pm.sock`)) {
        await new Promise((r) => setTimeout(r, 100));
    }
}
