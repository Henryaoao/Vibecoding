import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(rootDir, "tasks.json");
const port = Number(process.env.PORT || 8000);
const host = "127.0.0.1";

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
]);

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${host}:${port}`);

    if (req.method === "GET" && url.pathname === "/api/tasks") {
      return send(res, 200, await readFile(dataPath, "utf8"), "application/json; charset=utf-8");
    }

    if (req.method === "PUT" && url.pathname === "/api/tasks") {
      const body = await readBody(req);
      const parsed = JSON.parse(body);
      await writeFile(dataPath, `${JSON.stringify(parsed, null, 2)}\n`);
      return send(res, 200, JSON.stringify({ ok: true }), "application/json; charset=utf-8");
    }

    if (req.method !== "GET") {
      return send(res, 405, "Method not allowed");
    }

    const filePath = resolveStaticPath(url.pathname);
    const contentType = mimeTypes.get(path.extname(filePath)) || "application/octet-stream";
    return send(res, 200, await readFile(filePath), contentType);
  } catch (error) {
    const status = error.code === "ENOENT" ? 404 : 500;
    return send(res, status, status === 404 ? "Not found" : String(error.message || error));
  }
});

server.listen(port, host, () => {
  console.log(`ProjectM task management: http://${host}:${port}/`);
});

function resolveStaticPath(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const normalized = path.normalize(decoded === "/" ? "/index.html" : decoded);
  const filePath = path.join(rootDir, normalized);
  if (!filePath.startsWith(rootDir)) {
    throw Object.assign(new Error("Forbidden"), { code: "ENOENT" });
  }
  return filePath;
}

function send(res, status, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}
