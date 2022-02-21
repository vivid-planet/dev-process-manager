import { Command } from 'commander';
import { start, shutdown, status, logs, restart } from "./commands";

const program = new Command();
program.command("start <pmConfigFilePath>")
  .action((pmConfigFilePath) => {
    start(pmConfigFilePath);
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
