#!/usr/bin/env node

import { Command } from "commander";

import { logs, restart, shutdown, start, status } from "./commands";
import { startDaemon } from "./commands/start-daemon.command";
import { stop } from "./commands/stop.command";

const program = new Command();

program
    .command("start")
    .option("--only <scripts...>", "Only start specified scripts")
    .option("--onlyGroup <groups...>", "Only start scripts in specified group")
    .action((options) => {
        start(options);
    });

program.command("logs [name]").action((name) => {
    logs(name);
});

program.command("status").action(() => {
    status();
});

program.command("restart <name>").action((name) => {
    restart(name);
});

program.command("stop <name>").action((name) => {
    stop(name);
});

program.command("shutdown").action(() => {
    shutdown();
});

program.command("start-daemon").action(() => {
    startDaemon();
});

program.parse(process.argv);
