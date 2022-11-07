import { RestartCommandOptions } from "../daemon-command/restart.daemon-command";
import { connect } from "./connect";

export const restart = async (options: RestartCommandOptions): Promise<void> => {
    const client = await connect();
    client.write(`restart ${JSON.stringify(options)}`);
};
