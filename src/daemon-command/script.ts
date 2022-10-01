import { ChildProcess, execSync, spawn } from "child_process";
import colors from "colors";
import { Socket } from "net";

import { ScriptDefinition } from "../script-definition.type";

const KEEP_LOG_LINES = 100;

export class Script {
    scriptDefinition: ScriptDefinition;
    status: "started" | "stopping" | "stopped" = "stopped";
    process?: ChildProcess;
    logBuffer: string[] = [];
    logSockets: Socket[] = [];

    constructor(scriptDefinition: ScriptDefinition) {
        this.scriptDefinition = scriptDefinition;
    }

    get name(): string {
        return this.scriptDefinition.name;
    }
    get groups(): string[] {
        if (!this.scriptDefinition.group) return [];
        return Array.isArray(this.scriptDefinition.group) ? this.scriptDefinition.group : [this.scriptDefinition.group];
    }
    async killProcess(socket?: Socket): Promise<void> {
        if (this.process && !this.process.killed) {
            console.log(`killing ${this.name}`);
            socket?.write(`killing ${this.name}\n`);
            process.kill(-this.process.pid);
            while (this.status != "stopped") {
                console.log(`waiting for killed`);
                socket?.write(`waiting for killed\n`);
                await new Promise((r) => setTimeout(r, 100));
            }
        }
    }

    handleLogs(data: Buffer): void {
        this.logSockets.forEach((socket) => {
            socket.write(`${this.name}: ${data}`);
        });
        const incomingLines = data.toString().split("\n");
        if (incomingLines[incomingLines.length - 1] == "") incomingLines.splice(incomingLines.length - 1, 1);
        const removeLines = incomingLines.length - (KEEP_LOG_LINES - this.logBuffer.length);
        this.logBuffer.splice(0, removeLines > 0 ? removeLines : 0, ...incomingLines);
    }

    startProcess(): void {
        console.log(`${colors.bgGreen.bold.black(" dev-pm ")} starting: ${this.scriptDefinition.script}`);
        const NPM_PATH = execSync("npm bin").toString().trim();
        this.status = "started";
        const p = spawn("bash", ["-c", this.scriptDefinition.script], {
            detached: true,
            env: { ...process.env, PATH: `${NPM_PATH}:${process.env.PATH}` },
        });
        this.process = p;
        p.stdout.on("data", (data: Buffer) => {
            process.stdout.write(data);
            this.handleLogs(data);
        });
        p.stderr.on("data", (data: Buffer) => {
            process.stderr.write(data);
            this.handleLogs(data);
        });

        p.on("close", () => {
            if (this.status == "started") {
                console.log(`${colors.bgRed.bold.black(" dev-pm ")} process stopped ${this.name}, restarting...`);
                this.startProcess();
            } else {
                console.log(`${colors.bgRed.bold.black(" dev-pm ")} process stopped ${this.name}`);
                this.status = "stopped";
            }
        });
        p.on("error", (err) => {
            // TODO handle
            console.error(err);
            console.log(`${colors.bgRed.bold.black(" dev-pm ")} Failed starting process  ${this.name}`);
        });
    }
}
