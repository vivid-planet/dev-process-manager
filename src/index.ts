#!/usr/bin/env node

import { Command } from "commander";

import { logs, restart, shutdown, start, status } from "./commands";

const program = new Command();

program
    .command("start [pmConfigFilePath]")
    .option("--only <scripts...>", "Only start specified scripts")
    .option("--onlyGroup <groups...>", "Only start scripts in specified group")
    .action((pmConfigFilePath, options) => {
        start(pmConfigFilePath, options);
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

program.command("stop").action(() => {
    shutdown();
});

program.parse(process.argv);
