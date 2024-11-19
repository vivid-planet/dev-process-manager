import colors from "colors";
import { existsSync, watchFile } from "fs";
import { createServer, Server } from "net";

import { Config } from "../config.type";
import { logsDaemonCommand } from "../daemon-command/logs.daemon-command";
import { restartDaemonCommand } from "../daemon-command/restart.daemon-command";
import { Script } from "../daemon-command/script";
import { shutdown } from "../daemon-command/shutdown";
import { shutdownDaemonCommand } from "../daemon-command/shutdown.daemon-command";
import { startDaemonCommand } from "../daemon-command/start.daemon-command";
import { statusDaemonCommand } from "../daemon-command/status.daemon-command";
import { stopDaemonCommand } from "../daemon-command/stop.daemon-command";
import { findConfigDir } from "../utils/find-config-dir";

export interface Daemon {
    scripts: Script[];
    server?: Server;
}

export const startDaemon = async (): Promise<void> => {
    process.chdir(findConfigDir());
    const pmConfigFileName = "dev-pm.config.js";
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { scripts: scriptDefinitions }: Config = require(`${process.cwd()}/${pmConfigFileName}`);
    const daemon: Daemon = {
        scripts: scriptDefinitions.map((scriptDefinition, id) => {
            return new Script({ ...scriptDefinition, id });
        }),
        server: undefined,
    };

    watchFile(`${process.cwd()}/${pmConfigFileName}`, async () => {
        console.log(`${pmConfigFileName} file changed, reloading scripts`);
        delete require.cache[require.resolve(`${process.cwd()}/${pmConfigFileName}`)];
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { scripts: scriptDefinitions }: Config = require(`${process.cwd()}/${pmConfigFileName}`);

        daemon.scripts = daemon.scripts.filter((script) => {
            if (!scriptDefinitions.find((s) => s.name === script.name)) {
                console.log("Removing script", script.name);
                script.killProcess();
                return false;
            } else {
                return true;
            }
        });

        scriptDefinitions.forEach((scriptDefinition, id) => {
            const script = daemon.scripts.find((s) => s.name === scriptDefinition.name);
            if (script) {
                console.log("Updating script definition", script.name);
                script.updateScriptDefinition({ ...scriptDefinition, id });
            } else {
                console.log("Adding new script", scriptDefinition.name);
                daemon.scripts.push(new Script({ ...scriptDefinition, id }));
            }
        });
    });

    if (existsSync(`.pm.sock`)) {
        console.log(
            "Could not start dev-pm server. A '.pm.sock' file already exists. \nThere are 2 possible reasons for this:\nA: Another dev-pm instance is already running. \nB: dev-pm crashed and left the file behind. In this case please remove the file manually.",
        );
        return;
    }

    daemon.server = createServer();
    daemon.server.listen(`.pm.sock`);
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
                s.write(`unknown command ${cmd}`);
                s.end();
            }
        });
    });
    console.log(`daemon started, listening for connections in .pm.sock`);

    process.on("SIGINT", function () {
        shutdown(daemon);
    });

    process.on("SIGTERM", function () {
        shutdown(daemon);
    });

    const events = ["rejectionHandled", "uncaughtException", "SIGABRT", "SIGHUP", "SIGPWR", "SIGQUIT"];
    events.forEach((eventName) => {
        process.on(eventName, (...args) => {
            console.log(`${colors.bgRed.bold.black(" dev-pm ")} unhandled error event "${eventName}" was called with args: ${args.join(",")}`);
            shutdown(daemon);
        });
    });
};
