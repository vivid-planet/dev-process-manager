import { spawn, ChildProcess } from "child_process";
import { Socket, createServer, createConnection } from "net";
import { Command } from 'commander';
import { start } from "./commands/start.command";
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

async function shutdown() {
  const client = createConnection(".pm.sock")
  client.on('connect', () => {
    client.write("shutdown");
  });
}

async function logs(name?: string) {
  const client = createConnection(".pm.sock")
  client.on('connect', () => {
    if (name) {
      client.write("logs " + name);
    } else {
      //all logs
      client.write("logs");
    }

  });
  client.on("data", (data) => {
    //TODO handle stderr/stdin and also write on stderr
    process.stdout.write(data);
  })
}



async function restart(name: string) {
  const client = createConnection(".pm.sock")
  client.on('connect', () => {
    client.write("restart " + name);
  });
  client.on("data", (data) => {
    //TODO handle stderr/stdin and also write on stderr
    process.stdout.write(data);
  })
}


async function status() {
  const client = createConnection(".pm.sock")
  client.on('connect', () => {
    client.write("status");
  });
  client.on("data", (data) => {
    console.log(data.toString());
  })
}
