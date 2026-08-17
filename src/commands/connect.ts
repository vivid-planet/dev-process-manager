import { createConnection, type Socket } from "net";

import { loadConfig } from "../utils/load-config.js";
import { chdirToProjectRoot, SOCKET_FILE_NAME } from "../utils/socket.js";
import { autoStartDaemon } from "./auto-start-daemon.js";

export async function connect(): Promise<Socket> {
    await autoStartDaemon();
    const { sources } = await loadConfig();
    chdirToProjectRoot(sources[0]);

    return new Promise((resolve, reject) => {
        const client = createConnection(SOCKET_FILE_NAME);
        client.on("error", (error: { code: string }) => {
            if (error.code == "ECONNREFUSED") {
                console.log(`Error connecting to dev-pm daemon at ${SOCKET_FILE_NAME}.`);
                process.exit(-1);
            }
            reject(error);
        });
        client.on("connect", () => {
            resolve(client);
        });
    });
}

export function pipeToStdout(client: Socket): void {
    client.on("data", (data) => {
        //TODO handle stderr/stdin and also write on stderr
        process.stdout.write(data);
    });
}
