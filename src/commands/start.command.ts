import { spawn, ChildProcess } from "child_process";
import { Socket, createServer, createConnection } from "net";
import { AppDefinition } from "../app-definition.type";
import { existsSync } from "fs";

export const start = async (pmConfigFilePath: string) => {
  const { apps }: { apps: AppDefinition[] } = await import(`${process.cwd()}/${pmConfigFilePath}`);
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
        shutdown(s);
      } else {
        console.error("Unknown command", cmd);
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

  const events = ["beforeExit", "disconnected", "message", "rejectionHandled", "uncaughtException", "exit", "SIGABRT", "SIGHUP", "SIGPWR", "SIGQUIT"];

  events.forEach((eventName) => {
    process.on(eventName, (...args) => {
      console.log('Unhandled error event ' + eventName + ' was called with args : ' + args.join(','));
      shutdown();
    });
  });


  const shutdown = async (s?: Socket) => {
    console.log("shutting down");
    shuttingDown = true;
    await Promise.all(Object.values(processes).map(async p => {
      if (p.pid) {
        const list: { [key: string]: string[] } = await getChildProcesses(p.pid.toString(), { [p.pid]: [] }, { [p.pid]: 1 });
        killProcesses(list);
      }
    }));
    server.close();
    s?.destroy();
    process.exit();
  }

  const killProcesses = (tree: { [key: string]: string[] }) => {
    const killed: { [key: string]: number } = {};
    Object.keys(tree).map((pid) => {
      tree[pid].map((childPid) => {
        if (!killed[childPid]) {
          killPid(childPid);
          killed[childPid] = 1;
        }
        if (!killed[pid]) {
          killPid(pid);
          killed[pid] = 1;
        }
      })
    })
    return;
  }

  const killPid = (pid: string) => {
    try {
      process.kill(parseInt(pid, 10), "SIGINT");
    } catch (err) {
      console.error(err);
    }
  }

  const getChildProcesses = async (parentPid: string, tree: { [key: string]: string[] }, pidsToProcess: { [key: string]: number }): Promise<{ [key: string]: string[] }> => {
    return new Promise((resolve, reject) => {
      const ps = spawn('pgrep', ['-P', parentPid]);
      let allData = "";

      const onClose = (code: unknown) => {
        delete pidsToProcess[parentPid];
        if (code != 0) {
          if (Object.keys(pidsToProcess).length === 0) {
            resolve(tree);
          }
          return tree;
        }

        const pids = allData.match(/\d+/g) || [];
        if (pids.length === 0) {
          return resolve(tree);
        }
        pids.forEach(function (pid) {
          tree[parentPid].push(pid);
          tree[pid] = [];
          pidsToProcess[pid] = 1;
          resolve(getChildProcesses(pid, tree, pidsToProcess));
        })
      };

      ps.on('error', function (err) {
        console.error(err);
        reject(err);
      });

      ps.stdout.on('data', function (data) {
        data = data.toString('ascii');
        allData += data;
      })

      ps.on('close', onClose);
    })
  }
}
