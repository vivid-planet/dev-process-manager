import { createConnection } from "net";

export const status = async (): Promise<void> => {
    const client = createConnection(".pm.sock");
    client.on("connect", () => {
        client.write("status");
    });
    client.on("data", (data) => {
        console.log(data.toString());
    });
};
