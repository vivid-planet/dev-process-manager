import { Command } from 'commander';
import { start, shutdown, status, logs, restart } from "./commands";
import eco from "./ecosystem.config";

const program = new Command();
program.command("start")
  .action(() => {
    start(eco.apps);
  });

program.command("logs [name]")
  .action((name) => {
    logs(name);
  })

program.command("status")
  .action(() => {
    status();
  })

program.command("restart <name>")
  .action((name) => {
    restart(name);
  })

program.command("shutdown")
  .action(() => {
    shutdown();
  })

program.parse(process.argv);
