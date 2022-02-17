import { spawn, ChildProcess } from "child_process";
import { Socket, createServer, createConnection } from "net";
import { Command } from 'commander';

const eco = {
  apps: [
    {
      name: "sleep60",
      script: "echo sleep60 && sleep 60",
    },
    {
      name: "sleep3",
      script: "while true; do echo sleep3 && sleep 3; done",
    },
  ]
};

interface AppDefinition {
  name: string;
  script: string;
}

const program = new Command();
program.command("start")
  .action(() => {
    start();
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

async function start() {
  const processes: { [key: string]: ChildProcess } = {};
  const logSockets: { socket: Socket, name: string | null; }[] = [];
  let shuttingDown = false;

  function startProcess(app: AppDefinition) {

    console.log("starting " + app.script);
    const p = spawn("bash", ["-c", app.script]);
    p.stdout.on('data', data => {
      process.stdout.write(data);
      logSockets.forEach(s => {
        if (!s.name || s.name == app.name) {
          s.socket.write(data);
        }
      });
    });
    p.stderr.on('data', data => {
      process.stderr.write(data);
      logSockets.forEach(s => {
        if (!s.name || s.name == app.name) {
          s.socket.write(data);
        }
      });
    });
    p.on('close', code => {
      if (!shuttingDown) {
        console.error("process stopped", app.name, ", restarting");
        startProcess(app);
      }
    })
    p.on('error', (err) => {
      // TODO handle
      console.error(err);
      console.error("Failed starting process", app.name);
    });
    processes[app.name] = p;
  }

  const server = createServer();
  server.listen(".pm.sock");
  server.on('connection', (s) => {
    s.on('data', async (command) => {
      //console.log("received command", command.toString());
      const cmd = command.toString();
      if (cmd == "logs" || cmd.startsWith("logs ")) {
        const name = cmd != "logs" ? cmd.substring(5) : null; // null means all
        logSockets.push({ socket: s, name });
        s.on('close', () => {
          var index = logSockets.findIndex(i => i.socket == s);
          if (index !== -1) {
            logSockets.splice(index, 1);
          }
        });
      } else if (cmd.startsWith("restart ")) {
        const name = cmd.substring(8);
        const p = processes[name];
        if (!p) {
          console.error("Unknown name");
          s.end();
          return;
        }

        if (!p.killed) {
          console.log("killing " + name);
          p.kill("SIGINT");
          while (!p.killed) {
            console.log("waiting for killed");
            await new Promise(r => setTimeout(r, 100));
          }
        }

        const app = eco.apps.find(i => i.name == name);
        if (!app) {
          console.error("Unknown name");
          s.end();
          return;
        }
        startProcess(app);
        s.end();

      } else if (cmd == "status") {
        const response = Object.keys(processes).map(name => {
          const p = processes[name];
          return {
            name,
            running: !p.killed
          }
        });
        console.log("sending status reponse", response);
        s.write(JSON.stringify(response));
        s.end();
      } else if (cmd == "shutdown") {
        console.log("shutting down");
        shuttingDown = true;
        Object.values(processes).forEach(p => {
          if (!p.killed) p.kill("SIGINT");
        })
        server.close();
        process.exit();
      } else {
        console.error("Unknown command", cmd);
      }
    });

  });


  eco.apps.forEach(app => {
    startProcess(app);
  });

  process.on("SIGINT", function () {
    console.log("shutting down")
    server.close();
    shuttingDown = true;
    for (const name in processes) {
      const p = processes[name];
      if (!p.killed) {
        console.log("killing " + name);
        p.kill("SIGINT");
      }
    }
  });
}
