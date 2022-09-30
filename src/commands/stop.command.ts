import { createConnection } from "net";

import { autoStartDaemon } from "./auto-start-deamon";

export const stop = async (name: string): Promise<void> => {
    await autoStartDaemon();

    const client = createConnection(".pm.sock");
    client.on("connect", () => {
        client.write(`stop ${name}`);
    });
    client.on("data", (data) => {
        //TODO handle stderr/stdin and also write on stderr
        process.stdout.write(data);
    });
};
