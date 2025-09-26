import { connect } from "./connect.js";

export const shutdown = async (): Promise<void> => {
    const client = await connect();
    client.write("shutdown");
};
