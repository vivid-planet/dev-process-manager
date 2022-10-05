import { ChildProcess, execSync, spawn } from "child_process";
import CLITable from "cli-table3";
import colors from "colors";
import { existsSync } from "fs";
import { createServer, Socket } from "net";

import { ScriptDefinition } from "../script-definition.type";

export const start = async (pmConfigFilePathOverride?: string, options?: { only?: string[] }): Promise<void> => {
    const pmConfigFilePath = pmConfigFilePathOverride ? pmConfigFilePathOverride : "dev-pm.config.js";
    const { scripts }: { scripts: ScriptDefinition[] } = await import(`${process.cwd()}/${pmConfigFilePath}`);
    const processes: { [key: string]: ChildProcess } = {};
    const logSockets: { socket: Socket; name: string | null }[] = [];
    let shuttingDown = false;
    let scriptsToStart: ScriptDefinition[] = [];

    if (options?.only && options?.only?.length > 0) {
        options.only.map((scriptName) => {
            const foundScript = scripts.find((script) => script.name === scriptName);
            if (foundScript) {
                scriptsToStart.push(foundScript);
            } else {
                console.error(`${colors.bgRed.bold.black(" dev-pm ")} Script ${scriptName} not found in dev-pm config`);
                process.exit(1);
            }
        });
    } else {
        scriptsToStart = scripts;
    }

    function startProcess(script: ScriptDefinition): void {
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
            if (!shuttingDown) {
                console.log(`${colors.bgRed.bold.black(" dev-pm ")} process stopped ${script.name}, restarting...`);
                startProcess(script);
            }
        });
        p.on("error", (err) => {
            // TODO handle
            console.error(err);
            console.log(`${colors.bgRed.bold.black(" dev-pm ")} Failed starting process  ${script.name}`);
        });
        processes[script.name] = p;
    }

    if (existsSync("./.pm.sock")) {
        console.log(
            "Could not start dev-pm server. A '.pm.sock' file already exists. \nThere are 2 possible reasons for this:\nA: Another dev-pm instance is already running. \nB: dev-pm crashed and left the file behind. In this case please remove the file manually.",
        );
        return;
    }

    const server = createServer();
    server.listen(".pm.sock");
    server.on("connection", (s) => {
        s.on("data", async (command) => {
            const cmd = command.toString();
            if (cmd == "logs" || cmd.startsWith("logs ")) {
                const name = cmd != "logs" ? cmd.substring(5) : null; // null means all
                if (name && !scripts.find((script) => script.name === name)) {
                    console.error("Unknown name");
                } else {
                    logSockets.push({ socket: s, name });
                    s.on("close", () => {
                        const index = logSockets.findIndex((i) => i.socket == s);
                        if (index !== -1) {
                            logSockets.splice(index, 1);
                        }
                    });
                }
            } else if (cmd.startsWith("restart ")) {
                const name = cmd.substring(8);
                const p = processes[name];
                if (!p) {
                    console.log(`${colors.bgYellow.bold.black(" dev-pm ")} unknown name  ${name}`);
                    s.end();
                    return;
                }

                if (!p.killed) {
                    console.log(`${colors.bgYellow.bold.black(" dev-pm ")} killing ${name}`);
                    p.kill("SIGINT");
                    while (!p.killed) {
                        console.log(`${colors.bgYellow.bold.black(" dev-pm ")} waiting for killed`);
                        await new Promise((r) => setTimeout(r, 100));
                    }
                }

                const script = scripts.find((i) => i.name == name);
                if (!script) {
                    console.log(`${colors.bgYellow.bold.black(" dev-pm ")} unknown name  ${name}`);
                    s.end();
                    return;
                }
                startProcess(script);
                s.end();
            } else if (cmd == "status") {
                const response = Object.keys(processes).map((name) => {
                    const p = processes[name];
                    return {
                        name,
                        running: !p.killed,
                        pid: p.pid,
                    };
                });

                const table = new CLITable({
                    head: [colors.blue.bold("Script"), colors.blue.bold("Status"), colors.bold.blue("PID")],
                    colWidths: [100, 20, 20],
                });
                response.forEach((item) => {
                    table.push([item.name, item.running ? colors.green("Running") : colors.red("Stopped"), item.pid?.toString()]);
                });
                s.write(table.toString());
                s.end();
            } else if (cmd == "shutdown") {
                shutdown(s);
            } else {
                console.log(`${colors.bgYellow.bold.black(" dev-pm ")} unknown command ${cmd}`);
            }
        });
    });

    scriptsToStart.forEach((script) => {
        startProcess(script);
    });

    process.on("SIGINT", function () {
        shutdown();
    });

    process.on("SIGTERM", function () {
        shutdown();
    });

    const events = ["beforeExit", "disconnected", "message", "rejectionHandled", "uncaughtException", "SIGABRT", "SIGHUP", "SIGPWR", "SIGQUIT"];

    events.forEach((eventName) => {
        process.on(eventName, (...args) => {
            console.log(`${colors.bgRed.bold.black(" dev-pm ")} unhandled error event "${eventName}" was called with args: ${args.join(",")}`);
            shutdown();
        });
    });

    const shutdown = async (s?: Socket): Promise<void> => {
        console.log(`${colors.bgGreen.bold.black(" dev-pm ")} shutting down`);
        shuttingDown = true;
        await Promise.all(
            Object.values(processes).map(async (p) => {
                if (p.pid) {
                    process.kill(-p.pid);
                }
            }),
        );
        server.close();
        s?.destroy();
        process.exit();
    };
};
