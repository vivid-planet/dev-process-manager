import { createConnection } from "net";

export const status = async () => {
  const client = createConnection(".pm.sock")
  client.on('connect', () => {
    client.write("status");
  });
  client.on("data", (data) => {
    console.log(data.toString());
  })
}
