import { createConnection } from "net";

import { autoStartDaemon } from "./auto-start-deamon";

export const status = async (names: string[]): Promise<void> => {
    await autoStartDaemon();

    const client = createConnection(".pm.sock");
    client.on("connect", () => {
        client.write(`status ${JSON.stringify(names)}`);
    });
    client.on("data", (data) => {
        console.log(data.toString());
    });
};
