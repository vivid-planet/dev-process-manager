export default {
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
