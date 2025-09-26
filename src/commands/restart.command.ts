import { RestartCommandOptions } from "../daemon-command/restart.daemon-command.js";
import { connect } from "./connect.js";

export const restart = async (options: RestartCommandOptions): Promise<void> => {
    const client = await connect();
    client.write(`restart ${JSON.stringify(options)}`);
};
