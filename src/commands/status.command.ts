import { createConnection } from "net";

import { autoStartDaemon } from "./auto-start-deamon";

export const status = async (name?: string): Promise<void> => {
    await autoStartDaemon();

    const client = createConnection(".pm.sock");
    client.on("connect", () => {
        if (name) {
            client.write(`status ${name}`);
        } else {
            client.write(`status`);
        }
    });
    client.on("data", (data) => {
        console.log(data.toString());
    });
};
