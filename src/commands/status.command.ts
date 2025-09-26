import { StatusCommandOptions } from "../daemon-command/status.daemon-command.js";
import { connect } from "./connect.js";

export const status = async (options: StatusCommandOptions): Promise<void> => {
    const client = await connect();
    client.write(`status ${JSON.stringify(options)}`);
};
