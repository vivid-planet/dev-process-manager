import { connect } from "./connect";

export const logs = async (names: string[]): Promise<void> => {
    const client = await connect();
    client.write(`logs ${JSON.stringify(names)}`);
};
