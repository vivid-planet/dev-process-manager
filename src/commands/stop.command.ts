import { connect } from "./connect";

export const stop = async (names: string[]): Promise<void> => {
    const client = await connect();
    client.write(`stop ${JSON.stringify(names)}`);
};
