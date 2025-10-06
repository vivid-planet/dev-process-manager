#!/usr/bin/env node

import { Command, Option } from "commander";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import { logs, restart, shutdown, start, status } from "./commands/index.js";
import { startDaemon } from "./commands/start-daemon.command.js";
import { stop } from "./commands/stop.command.js";

const program = new Command();

{
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const { version } = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf-8"));
    program.version(version);
}

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
