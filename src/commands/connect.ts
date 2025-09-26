import { createConnection, Socket } from "net";
import { dirname } from "path";

import { loadConfig } from "../utils/load-config.js";
import { autoStartDaemon } from "./auto-start-daemon.js";

export async function connect(): Promise<Socket> {
    await autoStartDaemon();
    const { sources } = await loadConfig();

    return new Promise((resolve, reject) => {
        const client = createConnection(`${dirname(sources[0])}/.pm.sock`);
        client.on("error", (error: { code: string }) => {
            if (error.code == "ECONNREFUSED") {
                console.log(
                    "Error connecting to dev-pm daemon at .pm.sock.\ndev-pm could have crashed and left the file behind. In this case please remove the file manually.",
                );
                process.exit(-1);
            }
            reject(error);
        });
        client.on("connect", () => {
            resolve(client);
        });
        client.on("data", (data) => {
            //TODO handle stderr/stdin and also write on stderr
            process.stdout.write(data);
        });
    });
}
