import { spawn, ChildProcess } from "child_process";
import { Socket, createServer, createConnection } from "net";
import { AppDefinition } from "../app-definition.type";

export const start = async (apps: AppDefinition[]) => {
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
      const cmd = command.toString();
      if (cmd == "logs" || cmd.startsWith("logs ")) {
        const name = cmd != "logs" ? cmd.substring(5) : null; // null means all
        if (name && !apps.find((app) => app.name === name)) {
          console.error("Unknown name");
        } else {
          logSockets.push({ socket: s, name });
          s.on('close', () => {
            var index = logSockets.findIndex(i => i.socket == s);
            if (index !== -1) {
              logSockets.splice(index, 1);
            }
          });
        }
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

        const app = apps.find(i => i.name == name);
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

  apps.forEach(app => {
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
