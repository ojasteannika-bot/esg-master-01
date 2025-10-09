module.exports = {
  apps: [{
    name: "esglite",
    script: "node",
    args: ".next/standalone/server.js",
    cwd: ".",
    env: { PORT: 3001, NODE_ENV: "production" }
  }]
}
