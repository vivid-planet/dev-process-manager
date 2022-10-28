import { connect } from "./connect";

export const start = async (names: string[]): Promise<void> => {
    const client = await connect();
    client.write(`start ${JSON.stringify(names)}`);
};
