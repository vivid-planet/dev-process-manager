#!/usr/bin/env node

import { Command, Option } from "commander";
import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";

import { logs, restart, shutdown, start, status } from "./commands";
import { startDaemon } from "./commands/start-daemon.command";
import { stop } from "./commands/stop.command";

const env = dotenv.config();
dotenvExpand.expand(env);

const program = new Command();

program
    .command("start [name...]")
    .option("--follow", "Follow logs after starting script")
    .action((names, options) => {
        start({ names, follow: !!options.follow });
    });

program.command("logs [name...]").action((names) => {
    logs(names);
});

program
    .command("status [name...]")
    .aliases(["list", "ls"])
    .addOption(new Option("-i, --interval [seconds]", "Keep status open and refresh periodically at given interval").preset("1"))
    .action((names, options) => {
        status({ names, interval: options.interval ? parseInt(options.interval) : undefined });
    });

program
    .command("restart [name...]")
    .option("--follow", "Follow logs after starting script")
    .action((names, options) => {
        restart({ names, follow: !!options.follow });
    });

program.command("stop [name...]").action((names) => {
    stop(names);
});

program
    .command("shutdown")
    .alias("del")
    .action(() => {
        shutdown();
    });

program.command("start-daemon").action(() => {
    startDaemon();
});

program.parse(process.argv);
