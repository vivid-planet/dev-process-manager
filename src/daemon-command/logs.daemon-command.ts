import colors from "colors";
import { Socket } from "net";
import { Daemon } from "src/commands/start.command";

export function logsDaemonCommand({ logSockets, scripts }: Daemon, socket: Socket, scriptName: string | null /* null means all */): void {
    if (scriptName && !scripts.find((script) => script.name === scriptName)) {
        console.log(`${colors.bgYellow.bold.black(" dev-pm ")} unknown script name  ${scriptName}`);
    } else {
        logSockets.push({ socket, name: scriptName });
        socket.on("close", () => {
            const index = logSockets.findIndex((i) => i.socket == socket);
            if (index !== -1) {
                logSockets.splice(index, 1);
            }
        });
    }
}
