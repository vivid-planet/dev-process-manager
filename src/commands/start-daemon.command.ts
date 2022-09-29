import { ChildProcess } from "child_process";
import colors from "colors";
import { existsSync } from "fs";
import { createServer, Server, Socket } from "net";

import { logsDaemonCommand } from "../daemon-command/logs.daemon-command";
import { restartDaemonCommand } from "../daemon-command/restart.daemon-command";
import { shutdown } from "../daemon-command/shutdown";
import { shutdownDaemonCommand } from "../daemon-command/shutdown.daemon-command";
import { startDaemonCommand } from "../daemon-command/start.deamon-command";
import { statusDaemonCommand } from "../daemon-command/status.daemon-command";
import { ScriptDefinition } from "../script-definition.type";

export interface Daemon {
    logSockets: { socket: Socket; name: string | null }[];
    scripts: ScriptDefinition[];
    processes: { [key: string]: ChildProcess };
    shuttingDown: boolean;
    server?: Server;
}

export const startDaemon = async (pmConfigFilePathOverride?: string): Promise<void> => {
    const pmConfigFilePath = pmConfigFilePathOverride ? pmConfigFilePathOverride : "dev-pm.config.js";
    const { scripts }: { scripts: ScriptDefinition[] } = await import(`${process.cwd()}/${pmConfigFilePath}`);
    const processes: { [key: string]: ChildProcess } = {};
    const logSockets: { socket: Socket; name: string | null }[] = [];
    const daemon: Daemon = {
        logSockets,
        scripts,
        processes,
        shuttingDown: false,
        server: undefined,
    };

    if (existsSync("./.pm.sock")) {
        console.log(
            "Could not start dev-pm server. A '.pm.sock' file already exists. \nThere are 2 possible reasons for this:\nA: Another dev-pm instance is already running. \nB: dev-pm crashed and left the file behind. In this case please remove the file manually.",
        );
        return;
    }

    daemon.server = createServer();
    daemon.server.listen(".pm.sock");
    daemon.server.on("connection", (s) => {
        s.on("data", async (command) => {
            const cmd = command.toString();

            if (cmd == "logs" || cmd.startsWith("logs ")) {
                const scriptName = cmd != "logs" ? cmd.substring(5) : null; // null means all
                logsDaemonCommand(daemon, s, scriptName);
            } else if (cmd.startsWith("restart ")) {
                const scriptName = cmd.substring(8);
                restartDaemonCommand(daemon, s, scriptName);
            } else if (cmd.startsWith("start ")) {
                const options = JSON.parse(cmd.substring(6));
                startDaemonCommand(daemon, s, options);
            } else if (cmd == "status") {
                statusDaemonCommand(daemon, s);
            } else if (cmd == "shutdown") {
                shutdownDaemonCommand(daemon, s);
            } else {
                console.log(`${colors.bgYellow.bold.black(" dev-pm ")} unknown command ${cmd}`);
            }
        });
    });
    console.log(`${colors.bgYellow.bold.black(" dev-pm ")} daemon started, listening for connections in .pm.sock`);

    process.on("SIGINT", function () {
        shutdown(daemon);
    });

    process.on("SIGTERM", function () {
        shutdown(daemon);
    });

    const events = ["beforeExit", "disconnected", "message", "rejectionHandled", "uncaughtException", "SIGABRT", "SIGHUP", "SIGPWR", "SIGQUIT"];

    events.forEach((eventName) => {
        process.on(eventName, (...args) => {
            console.log(`${colors.bgRed.bold.black(" dev-pm ")} unhandled error event "${eventName}" was called with args: ${args.join(",")}`);
            shutdown(daemon);
        });
    });
};
