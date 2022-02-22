import { spawn, ChildProcess } from "child_process";
import { Socket, createServer, createConnection } from "net";
import { AppDefinition } from "../app-definition.type";
import { existsSync } from "fs";
import { unlinkSync } from "fs";
import CLITable from 'cli-table3';
import colors from 'colors';

export const start = async (pmConfigFilePathOverride?: string) => {
  const pmConfigFilePath = pmConfigFilePathOverride ? pmConfigFilePathOverride : "dev-pm.config.js"
  const { apps }: { apps: AppDefinition[] } = await import(`${process.cwd()}/${pmConfigFilePath}`);
  const processes: { [key: string]: ChildProcess } = {};
  const logSockets: { socket: Socket, name: string | null; }[] = [];
  let shuttingDown = false;

  function startProcess(app: AppDefinition) {
    console.log(`${colors.bgGreen.bold.black(" DPM ")} starting: ${app.script}`);
    const p = spawn("bash", ["-c", app.script], { detached: true });
    p.stdout.on('data', data => {
      process.stdout.write(data);
      logSockets.forEach(s => {
        if (!s.name || s.name == app.name) {
          s.socket.write(`${s.name}: ${data}`);
        }
      });
    });
    p.stderr.on('data', data => {
      process.stderr.write(data);
      logSockets.forEach(s => {
        if (!s.name || s.name == app.name) {
          s.socket.write(`${s.name}: ${data}`);
        }
      });
    });
    p.on('close', () => {
      if (!shuttingDown) {
        console.log(`${colors.bgRed.bold.black(" DPM ")} process stopped ${app.name}, restarting...`);
        startProcess(app);
      }
    })
    p.on('error', (err) => {
      // TODO handle
      console.error(err);
      console.log(`${colors.bgRed.bold.black(" DPM ")} Failed starting process  ${app.name}`);
    });
    processes[app.name] = p;
  }

  if (existsSync("./.pm.sock")) {
    console.log("Could not start dev-pm server. A '.pm.sock' file already exists. \nThere are 2 possible reasons for this:\nA: Another dev-pm instance is already running. \nB: dev-pm crashed and left the file behind. In this case please remove the file manually.");
    return;
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
          console.log(`${colors.bgYellow.bold.black(" DPM ")} unknown name  ${name}`);
          s.end();
          return;
        }

        if (!p.killed) {
          console.log(`${colors.bgYellow.bold.black(" DPM ")} killing ${name}`);
          p.kill("SIGINT");
          while (!p.killed) {
            console.log(`${colors.bgYellow.bold.black(" DPM ")} waiting for killed`);
            await new Promise(r => setTimeout(r, 100));
          }
        }

        const app = apps.find(i => i.name == name);
        if (!app) {
          console.log(`${colors.bgYellow.bold.black(" DPM ")} unknown name  ${name}`);
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
            running: !p.killed,
            pid: p.pid,
          }
        });

        const table = new CLITable({
          head: [colors.blue.bold("Application"), colors.blue.bold("Status"), colors.bold.blue("PID")],
          colWidths: [100, 20, 20]
        });
        response.forEach((item) => {
          table.push([item.name, item.running ? colors.green("Running") : colors.red("Stopped"), item.pid?.toString()])
        })
        s.write(table.toString());
        s.end();
      } else if (cmd == "shutdown") {
        shutdown(s);
      } else {
        console.log(`${colors.bgYellow.bold.black(" DPM ")} unknown command ${cmd}`);
      }
    });
  });

  apps.forEach(app => {
    startProcess(app);
  });

  process.on("SIGINT", function () {
    shutdown();
  });

  process.on("SIGTERM", function () {
    shutdown();
  });

  const events = ["beforeExit", "disconnected", "message", "rejectionHandled", "uncaughtException", "SIGABRT", "SIGHUP", "SIGPWR", "SIGQUIT"];

  events.forEach((eventName) => {
    process.on(eventName, (...args) => {
      console.log(`${colors.bgRed.bold.black(" DPM ")} unhandled error event "${eventName}" was called with args: ${args.join(',')}`);
      shutdown();
    });
  });


  const shutdown = async (s?: Socket) => {
    console.log(`${colors.bgGreen.bold.black(" DPM ")} shutting down`);
    shuttingDown = true;
    await Promise.all(Object.values(processes).map(async p => {
      if (p.pid) {
        process.kill(-p.pid);
      }
    }));
    server.close();
    s?.destroy();
    process.exit();
  }
}
