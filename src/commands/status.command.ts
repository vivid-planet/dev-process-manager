import { StatusCommandOptions } from "../daemon-command/status.daemon-command";
import { connect } from "./connect";

export const status = async (options: StatusCommandOptions): Promise<void> => {
    const client = await connect();
    client.write(`status ${JSON.stringify(options)}`);
};
