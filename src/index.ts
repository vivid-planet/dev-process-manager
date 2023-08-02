#!/usr/bin/env node

import { Command, Option } from "commander";
import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";

import { logs, restart, shutdown, start, status } from "./commands";
import { startDaemon } from "./commands/start-daemon.command";
import { stop } from "./commands/stop.command";

export { Config } from "./config.type";

const env = dotenv.config();
dotenvExpand.expand(env);

const program = new Command();
// eslint-disable-next-line @typescript-eslint/no-var-requires
program.version(require("../package.json").version);

program
    .command("start [patterns...]")
    .option("--follow", "Follow logs after starting script")
    .action((patterns: string[], options) => {
        start({ patterns, follow: !!options.follow });
    });

program
    .command("logs [patterns...]")
    .aliases(["log"])
    .action((patterns: string[]) => {
        logs({ patterns });
    });

program
    .command("status [patterns...]")
    .aliases(["list", "ls"])
    .addOption(new Option("-i, --interval [seconds]", "Keep status open and refresh periodically at given interval").preset("1"))
    .action((patterns: string[], options) => {
        status({ patterns, interval: options.interval ? parseInt(options.interval) : undefined });
    });

program
    .command("restart [patterns...]")
    .option("--follow", "Follow logs after starting script")
    .action((patterns: string[], options) => {
        restart({ patterns, follow: !!options.follow });
    });

program.command("stop [patterns...]").action((patterns: string[]) => {
    stop({ patterns });
});

program
    .command("shutdown")
    .alias("halt")
    .action(() => {
        shutdown();
    });

program.command("start-daemon").action(() => {
    startDaemon();
});

program.parse(process.argv);
