// Production process list for tmcdonald.ca. Managed with:
//   pm2 startOrRestart ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "jobos",
      cwd: "/home/JobOS",
      script: "node_modules/.bin/vite",
      args: "preview --port 3003 --host",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
