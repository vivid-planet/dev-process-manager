import { ChildProcess, execSync, spawn } from "child_process";
import colors from "colors";
import { Socket } from "net";
import waitOn from "wait-on";

import { ScriptDefinition } from "../script-definition.type";

const KEEP_LOG_LINES = 100;
export type ScriptStatus = "started" | "stopping" | "stopped" | "waiting" | "backoff";

export class Script {
    scriptDefinition: ScriptDefinition;
    status: ScriptStatus = "stopped";
    process?: ChildProcess;
    logBuffer: string[] = [];
    logSockets: Socket[] = [];
    logPrefix: string;
    restartCount = 0;

    constructor(scriptDefinition: ScriptDefinition) {
        this.scriptDefinition = scriptDefinition;
        const availableColors = [colors.red, colors.green, colors.yellow, colors.blue, colors.magenta, colors.cyan, colors.white, colors.grey];
        const color = availableColors[Math.floor(Math.random() * availableColors.length)];
        this.logPrefix = color(`${this.name}: `);
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
        if (this.status == "stopped" || this.status == "stopping") {
            // already stopped or stopping
        } else if (this.status == "waiting" || this.status == "backoff") {
            this.status = "stopped";
        } else if (this.status == "started") {
            if (this.process && this.process.pid) {
                this.status = "stopping";
                console.log(`killing ${this.name}`);
                socket?.write(`killing ${this.name}\n`);
                process.kill(-this.process.pid, "SIGINT");
                await new Promise((r) => setTimeout(r, 100));

                // this ts-ignore is required because ts thinks we can't do this.status != "stopped" when we set it to stopping in the same function. But this is async so it will happen.
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                while (this.status != "stopped") {
                    console.log(`waiting for  ${this.name} killed`);
                    socket?.write(`waiting for ${this.name} killed\n`);
                    await new Promise((r) => setTimeout(r, 500));
                }
            }
        }
    }

    addLogSocket(socket: Socket): void {
        this.logSockets.push(socket);
    }

    handleLogs(data: Buffer | string): void {
        const incomingLines = data.toString().split("\n");
        if (incomingLines[incomingLines.length - 1] == "") incomingLines.splice(incomingLines.length - 1, 1);
        for (const line of incomingLines) {
            console.log(`${this.logPrefix}${line}`);
            this.logSockets.forEach((socket) => {
                socket.write(`${this.logPrefix}${line}\n`);
            });
        }
        const removeLines = incomingLines.length - (KEEP_LOG_LINES - this.logBuffer.length);
        this.logBuffer.splice(0, removeLines > 0 ? removeLines : 0);
        this.logBuffer.splice(this.logBuffer.length, 0, ...incomingLines);
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
            } catch {
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

        p.on("close", async () => {
            if (this.status == "started") {
                this.handleLogs(`[dev-pm] process crashed, restarting...`);
                this.restartCount++;
                this.status = "backoff";
                const waitTime = Math.min(Math.pow(1.3, this.restartCount), 30);
                this.handleLogs(`[dev-pm] waiting ${Math.round(waitTime)}s between restarts`);
                await new Promise((r) => setTimeout(r, waitTime * 1000));
                if (this.status == "backoff") {
                    this.startProcess();
                }
            } else {
                this.handleLogs(`[dev-pm] process stopped`);
                this.status = "stopped";
            }
        });
        p.on("error", (err) => {
            // TODO handle
            console.error(err);
            this.handleLogs(`[dev-pm] Failed starting process`);
        });
    }
}
