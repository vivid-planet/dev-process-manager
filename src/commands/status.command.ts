import { StatusCommandOptions } from "../daemon-command/status.daemon-command.js";
import { connect } from "./connect.js";
import { validConfigOrExit } from "./validate-config.js";

export const status = async (options: StatusCommandOptions): Promise<void> => {
    await validConfigOrExit();
    const client = await connect();
    client.write(`status ${JSON.stringify(options)}`);
};
