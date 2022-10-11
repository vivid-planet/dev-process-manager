import { spawn } from "child_process";
import { existsSync } from "fs";

export async function autoStartDaemon(): Promise<void> {
    if (existsSync("./.pm.sock")) {
        // socket file already exists, we assume daemon is already running
        return;
    }
    console.log("starting dev-pm daemon...");
    const child = spawn(process.argv[0], [process.argv[1], "start-daemon"], { detached: true, stdio: ["ignore", "ignore", "ignore"] });
    child.unref();
    while (!existsSync("./.pm.sock")) {
        await new Promise((r) => setTimeout(r, 100));
    }
}
