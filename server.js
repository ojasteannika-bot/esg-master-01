// Minimal Next.js startup file (kasuta ainult kui host seda nõuab)
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3001;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Next.js app listening on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error("Next.js start error:", err);
  process.exit(1);
});
