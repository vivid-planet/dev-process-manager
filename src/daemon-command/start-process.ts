import { execSync, spawn } from "child_process";
import colors from "colors";

import { Daemon } from "../commands/start-daemon.command";
import { ScriptDefinition } from "../script-definition.type";

const KEEP_LOG_LINES = 100;

function handleLogs(daemon: Daemon, script: ScriptDefinition, data: Buffer): void {
    daemon.logSockets.forEach((s) => {
        if (!s.name || s.name == script.name) {
            s.socket.write(`${s.name}: ${data}`);
        }
    });
    const incomingLines = data.toString().split("\n");
    if (incomingLines[incomingLines.length - 1] == "") incomingLines.splice(incomingLines.length - 1, 1);
    const logBuffer = daemon.logBuffer[script.name];
    const removeLines = incomingLines.length - (KEEP_LOG_LINES - logBuffer.length);
    logBuffer.splice(0, removeLines > 0 ? removeLines : 0, ...incomingLines);
}

export function startProcess(daemon: Daemon, script: ScriptDefinition): void {
    console.log(`${colors.bgGreen.bold.black(" dev-pm ")} starting: ${script.script}`);
    const NPM_PATH = execSync("npm bin").toString().trim();
    daemon.scriptStatus[script.name] = "started";
    const p = spawn("bash", ["-c", script.script], { detached: true, env: { ...process.env, PATH: `${NPM_PATH}:${process.env.PATH}` } });
    p.stdout.on("data", (data: Buffer) => {
        process.stdout.write(data);
        handleLogs(daemon, script, data);
    });
    p.stderr.on("data", (data: Buffer) => {
        process.stderr.write(data);
        handleLogs(daemon, script, data);
    });

    p.on("close", () => {
        if (daemon.scriptStatus[script.name] == "started") {
            console.log(`${colors.bgRed.bold.black(" dev-pm ")} process stopped ${script.name}, restarting...`);
            startProcess(daemon, script);
        } else {
            console.log(`${colors.bgRed.bold.black(" dev-pm ")} process stopped ${script.name}`);
            daemon.scriptStatus[script.name] = "stopped";
        }
    });
    p.on("error", (err) => {
        // TODO handle
        console.error(err);
        console.log(`${colors.bgRed.bold.black(" dev-pm ")} Failed starting process  ${script.name}`);
    });
    daemon.processes[script.name] = p;
}
