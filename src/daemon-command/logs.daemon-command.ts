import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command.js";
import { handleLogSocketClose } from "./handle-log-socket-close.js";
import { scriptsMatchingPattern, ScriptsMatchingPatternOptions } from "./scripts-matching-pattern.js";

export type LogsCommandOptions = ScriptsMatchingPatternOptions;

export function logsDaemonCommand(daemon: Daemon, socket: Socket, options: LogsCommandOptions): void {
    const scriptsToProcess = scriptsMatchingPattern(daemon, { patterns: options.patterns });
    if (!scriptsToProcess.length) {
        socket.write("No matching scripts found in dev-pm config");
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
