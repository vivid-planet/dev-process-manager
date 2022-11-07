import { connect } from "./connect";

export const status = async (names: string[]): Promise<void> => {
    const client = await connect();
    client.write(`status ${JSON.stringify(names)}`);
};
