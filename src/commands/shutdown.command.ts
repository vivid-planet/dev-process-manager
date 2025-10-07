import { connect } from "./connect.js";
import { validConfigOrExit } from "./validate-config.js";

export const shutdown = async (): Promise<void> => {
    await validConfigOrExit();
    const client = await connect();
    client.write("shutdown");
};
