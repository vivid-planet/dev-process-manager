import { execSync, spawn } from "child_process";
import colors from "colors";

import { Daemon } from "../commands/start-daemon.command";
import { ScriptDefinition } from "../script-definition.type";

export function startProcess(daemon: Daemon, script: ScriptDefinition): void {
    const { logSockets, processes } = daemon;
    console.log(`${colors.bgGreen.bold.black(" dev-pm ")} starting: ${script.script}`);
    const NPM_PATH = execSync("npm bin").toString().trim();
    const p = spawn("bash", ["-c", script.script], { detached: true, env: { ...process.env, PATH: `${NPM_PATH}:${process.env.PATH}` } });
    p.stdout.on("data", (data) => {
        process.stdout.write(data);
        logSockets.forEach((s) => {
            if (!s.name || s.name == script.name) {
                s.socket.write(`${s.name}: ${data}`);
            }
        });
    });
    p.stderr.on("data", (data) => {
        process.stderr.write(data);
        logSockets.forEach((s) => {
            if (!s.name || s.name == script.name) {
                s.socket.write(`${s.name}: ${data}`);
            }
        });
    });
    p.on("close", () => {
        if (!daemon.shuttingDown) {
            console.log(`${colors.bgRed.bold.black(" dev-pm ")} process stopped ${script.name}, restarting...`);
            startProcess(daemon, script);
        }
    });
    p.on("error", (err) => {
        // TODO handle
        console.error(err);
        console.log(`${colors.bgRed.bold.black(" dev-pm ")} Failed starting process  ${script.name}`);
    });
    processes[script.name] = p;
}
