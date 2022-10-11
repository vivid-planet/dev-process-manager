#!/usr/bin/env node

import { Command } from "commander";

import { logs, restart, shutdown, start, status } from "./commands";
import { startDaemon } from "./commands/start-daemon.command";
import { stop } from "./commands/stop.command";

const program = new Command();

program.command("start [name...]").action((names) => {
    start(names);
});

program.command("logs [name...]").action((names) => {
    logs(names);
});

program.command("status [name...]").action((names) => {
    status(names);
});

program.command("restart [name...]").action((names) => {
    restart(names);
});

program.command("stop [name...]").action((names) => {
    stop(names);
});

program.command("shutdown").action(() => {
    shutdown();
});

program.command("start-daemon").action(() => {
    startDaemon();
});

program.parse(process.argv);
