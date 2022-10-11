import { createConnection } from "net";

import { autoStartDaemon } from "./auto-start-deamon";

export const restart = async (name?: string): Promise<void> => {
    await autoStartDaemon();

    const client = createConnection(".pm.sock");
    client.on("connect", () => {
        if (name) {
            client.write(`restart ${name}`);
        } else {
            client.write(`restart`);
        }
    });
    client.on("data", (data) => {
        //TODO handle stderr/stdin and also write on stderr
        process.stdout.write(data);
    });
};
