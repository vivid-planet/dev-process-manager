import { type Socket } from "net";

import { type Daemon } from "../commands/start-daemon.command.js";
import { handleLogSocketClose } from "./handle-log-socket-close.js";
import { scriptsMatchingPattern, type ScriptsMatchingPatternOptions } from "./scripts-matching-pattern.js";

export interface LogsCommandOptions extends ScriptsMatchingPatternOptions {
    lines?: number;
}

export function logsDaemonCommand(daemon: Daemon, socket: Socket, options: LogsCommandOptions): void {
    const scriptsToProcess = scriptsMatchingPattern(daemon, { patterns: options.patterns });
    if (!scriptsToProcess.length) {
        socket.write("No matching scripts found in dev-pm config\n");
        socket.end();
        return;
    }

    if (options.lines !== undefined) {
        for (const script of scriptsToProcess) {
            const lastLines = script.logBuffer.slice(-options.lines);
            for (const line of lastLines) {
                socket.write(`${script.logPrefix}${line}\n`);
            }
        }
        socket.end();
        return;
    }

    for (const script of scriptsToProcess) {
        for (const line of script.logBuffer) {
            socket.write(`${script.logPrefix}${line}\n`);
        }
        script.addLogSocket(socket);
    }

    socket.on("close", () => {
        handleLogSocketClose(daemon, socket);
    });
}
