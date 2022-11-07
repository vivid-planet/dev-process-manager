import { connect } from "./connect";

export const restart = async (names: string[]): Promise<void> => {
    const client = await connect();
    client.write(`restart ${JSON.stringify(names)}`);
};
