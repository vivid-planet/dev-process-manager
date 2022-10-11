import { ChildProcess, execSync, spawn } from "child_process";
import colors from "colors";
import { Socket } from "net";
import waitOn from "wait-on";

import { ScriptDefinition } from "../script-definition.type";

const KEEP_LOG_LINES = 100;

export class Script {
    scriptDefinition: ScriptDefinition;
    status: "started" | "stopping" | "stopped" | "waiting" = "stopped";
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
    get waitOn(): string[] {
        if (!this.scriptDefinition.waitOn) return [];
        const waitOn = Array.isArray(this.scriptDefinition.waitOn) ? this.scriptDefinition.waitOn : [this.scriptDefinition.waitOn];
        return waitOn.map((str) =>
            str.replace(/\$[a-z\d_]+/gi, function (match) {
                const sub = process.env[match.substring(1)];
                return sub || match;
            }),
        );
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

    handleLogs(data: Buffer | string): void {
        const incomingLines = data.toString().split("\n");
        if (incomingLines[incomingLines.length - 1] == "") incomingLines.splice(incomingLines.length - 1, 1);
        for (const line of incomingLines) {
            console.log(`${this.name}: ${line}`);
            this.logSockets.forEach((socket) => {
                socket.write(`${this.name}: ${line}\n`);
            });
        }
        const removeLines = incomingLines.length - (KEEP_LOG_LINES - this.logBuffer.length);
        this.logBuffer.splice(0, removeLines > 0 ? removeLines : 0);
        this.logBuffer.splice(this.logBuffer.length - 1, 0, ...incomingLines);
    }

    async startProcess(): Promise<void> {
        if (this.waitOn.length > 0) {
            this.status = "waiting";

            try {
                //first a silent try (to avoid too much console output)
                await waitOn({
                    resources: this.waitOn,
                    timeout: 1000,
                });
                this.handleLogs("[dev-pm] WAIT ON FINISHED WITHIN 1000ms");
            } catch {
                this.handleLogs("[dev-pm] WAIT ON FAILED WITHIN 1000ms");
                //then without timeout
                this.handleLogs("[dev-pm] waiting for required resources...");
                let pending = this.waitOn.length;
                await Promise.all(
                    this.waitOn.map(async (res) => {
                        this.handleLogs(`[dev-pm] waiting for ${res}`);
                        await waitOn({
                            resources: [res],
                        });
                        pending--;
                        this.handleLogs(`[dev-pm] finished waiting for ${res} (${pending} resources pending)`);
                    }),
                );
            }

            if (this.status !== "waiting") {
                // script could have been stopped while waiting
                return;
            }
        }

        this.handleLogs("[dev-pm] starting process...");
        const NPM_PATH = execSync("npm bin").toString().trim();
        this.status = "started";
        const p = spawn("bash", ["-c", this.scriptDefinition.script], {
            detached: true,
            env: { ...process.env, PATH: `${NPM_PATH}:${process.env.PATH}` },
        });
        this.process = p;
        p.stdout.on("data", (data: Buffer) => {
            this.handleLogs(data);
        });
        p.stderr.on("data", (data: Buffer) => {
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
