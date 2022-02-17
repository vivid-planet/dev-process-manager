import { createConnection } from "net";

export const restart = async (name: string) => {
  const client = createConnection(".pm.sock")
  client.on('connect', () => {
    client.write("restart " + name);
  });
  client.on("data", (data) => {
    //TODO handle stderr/stdin and also write on stderr
    process.stdout.write(data);
  })
}

