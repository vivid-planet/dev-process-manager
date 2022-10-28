import { connect } from "./connect";

export const shutdown = async (): Promise<void> => {
    const client = await connect();
    client.write("shutdown");
};
