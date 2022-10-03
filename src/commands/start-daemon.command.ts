import colors from "colors";
import { existsSync } from "fs";
import { createServer, Server } from "net";

import { logsDaemonCommand } from "../daemon-command/logs.daemon-command";
import { restartDaemonCommand } from "../daemon-command/restart.daemon-command";
import { Script } from "../daemon-command/script";
import { shutdown } from "../daemon-command/shutdown";
import { shutdownDaemonCommand } from "../daemon-command/shutdown.daemon-command";
import { startDaemonCommand } from "../daemon-command/start.deamon-command";
import { statusDaemonCommand } from "../daemon-command/status.daemon-command";
import { stopDaemonCommand } from "../daemon-command/stop.daemon-command";
import { ScriptDefinition } from "../script-definition.type";

export interface Daemon {
    scripts: Script[];
    server?: Server;
}

export const startDaemon = async (): Promise<void> => {
    const pmConfigFilePath = "dev-pm.config.js";
    const { scripts: scriptDefinitions }: { scripts: ScriptDefinition[] } = await import(`${process.cwd()}/${pmConfigFilePath}`);
    const scripts = scriptDefinitions.map((scriptDefinition) => {
        return new Script(scriptDefinition);
    });
    const daemon: Daemon = {
        scripts,
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

            if (cmd.startsWith("logs ")) {
                const names = JSON.parse(cmd.substring(5));
                logsDaemonCommand(daemon, s, names);
            } else if (cmd.startsWith("restart ")) {
                const names = JSON.parse(cmd.substring(8));
                restartDaemonCommand(daemon, s, names);
            } else if (cmd.startsWith("stop ")) {
                const names = JSON.parse(cmd.substring(5));
                stopDaemonCommand(daemon, s, names);
            } else if (cmd.startsWith("start ")) {
                const names = JSON.parse(cmd.substring(6));
                startDaemonCommand(daemon, s, names);
            } else if (cmd.startsWith("status ")) {
                const names = JSON.parse(cmd.substring(7));
                statusDaemonCommand(daemon, s, names);
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
