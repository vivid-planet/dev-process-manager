import { Socket } from "net";

import { Daemon } from "../commands/start-daemon.command";
import { scriptsMatchingPattern, ScriptsMatchingPatternOptions } from "./scripts-matching-pattern";

export type StopCommandOptions = ScriptsMatchingPatternOptions;

export async function stopDaemonCommand(daemon: Daemon, socket: Socket, options: StopCommandOptions): Promise<void> {
    const scriptsToProcess = scriptsMatchingPattern(daemon, { patterns: options.patterns });
    if (!scriptsToProcess.length) {
        socket.write("No matching scripts found in dev-pm config");
        socket.end();
        return;
    }

    await Promise.all(
        scriptsToProcess.map((script) => {
            return script.killProcess(socket);
        }),
    );

    socket.end();
}
