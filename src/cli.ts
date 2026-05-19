#!/usr/bin/env node

import chokidar from "chokidar";
import hljs from "highlight.js";
import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import { createServer, type Server } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

interface CliOptions {
  inputFile: string;
  outputFile: string;
  cssFile?: string;
  serve: boolean;
  watch: boolean;
}

const usage = `Usage:
  md2html input.md -o output.html
  md2html input.md --output output.html
  md2html input.md --css custom.css
  md2html input.md --watch --serve

Options:
  -o, --output <file>  Output HTML file
  --css <file>         Append a custom CSS file to the generated HTML
  --watch             Rebuild whenever the input file changes
  --serve             Start a local HTTP server to preview the HTML
  -h, --help          Show this help message`;

marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, language) {
      const validLanguage = language && hljs.getLanguage(language) ? language : "plaintext";
      return hljs.highlight(code, { language: validLanguage }).value;
    },
  }),
);

function parseArgs(args: string[]): CliOptions {
  let inputFile: string | undefined;
  let outputFile: string | undefined;
  let cssFile: string | undefined;
  let serve = false;
  let watch = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "-h" || arg === "--help") {
      console.log(usage);
      process.exit(0);
    }

    if (arg === "--watch") {
      watch = true;
      continue;
    }

    if (arg === "--serve") {
      serve = true;
      continue;
    }

    if (arg === "-o" || arg === "--output") {
      const value = args[index + 1];
      if (!value || value.startsWith("-")) {
        throw new Error(`${arg} requires an output file path.`);
      }
      outputFile = value;
      index += 1;
      continue;
    }

    if (arg === "--css") {
      const value = args[index + 1];
      if (!value || value.startsWith("-")) {
        throw new Error("--css requires a CSS file path.");
      }
      cssFile = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (inputFile) {
      throw new Error(`Unexpected extra argument: ${arg}`);
    }

    inputFile = arg;
  }

  if (!inputFile) {
    throw new Error("Missing input Markdown file.");
  }

  return {
    inputFile,
    outputFile: outputFile ?? getDefaultOutputFile(inputFile),
    cssFile,
    serve,
    watch,
  };
}

function getDefaultOutputFile(inputFile: string): string {
  const parsed = path.parse(inputFile);
  return path.join(parsed.dir, `${parsed.name}.html`);
}

function renderHtmlDocument(markdownHtml: string, title: string, customCss?: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f7f8fb;
      --paper: #ffffff;
      --text: #1f2937;
      --muted: #5f6b7a;
      --border: #d8dee8;
      --accent: #2563eb;
      --code-bg: #f1f5f9;
      --code-block-bg: #111827;
      --code-block-border: #263244;
      --code-block-text: #d1d5db;
      --list-guide: #cbd5e1;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.65;
    }

    main {
      width: min(860px, calc(100% - 32px));
      margin: 40px auto;
      padding: 40px;
      background: var(--paper);
      border: 1px solid var(--border);
      border-radius: 8px;
    }

    h1, h2, h3, h4, h5, h6 {
      line-height: 1.25;
      margin: 1.6em 0 0.6em;
    }

    h1 {
      margin-top: 0;
      padding-bottom: 0.35em;
      border-bottom: 1px solid var(--border);
    }

    p, pre, blockquote, table {
      margin: 0 0 1.1em;
    }

    ul, ol {
      margin: 0 0 1.1em;
      padding-left: 1.6rem;
    }

    li {
      padding-left: 0.25rem;
      margin: 0.28em 0;
    }

    li::marker {
      color: var(--muted);
      font-weight: 600;
    }

    li > ul,
    li > ol {
      margin: 0.38em 0 0.55em;
      padding-left: 1.45rem;
      border-left: 2px solid var(--list-guide);
    }

    ul ul {
      list-style-type: circle;
    }

    ul ul ul {
      list-style-type: square;
    }

    ol ol {
      list-style-type: lower-alpha;
    }

    ol ol ol {
      list-style-type: lower-roman;
    }

    a {
      color: var(--accent);
      text-decoration-thickness: 0.08em;
      text-underline-offset: 0.18em;
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
    }

    blockquote {
      padding: 0.2em 1em;
      color: var(--muted);
      border-left: 4px solid var(--border);
    }

    code {
      padding: 0.15em 0.35em;
      background: var(--code-bg);
      border-radius: 4px;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      font-size: 0.92em;
    }

    pre {
      overflow-x: auto;
      padding: 18px 20px;
      background: var(--code-block-bg);
      border: 1px solid var(--code-block-border);
      border-radius: 8px;
      box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.04);
    }

    pre code {
      padding: 0;
      background: transparent;
      border-radius: 0;
      color: var(--code-block-text);
      font-size: 0.9em;
      line-height: 1.7;
    }

    .hljs {
      color: var(--code-block-text);
      background: transparent;
    }

    .hljs-keyword,
    .hljs-selector-tag,
    .hljs-built_in {
      color: #c084fc;
    }

    .hljs-title,
    .hljs-title.function_,
    .hljs-function .hljs-title {
      color: #60a5fa;
    }

    .hljs-string,
    .hljs-attr,
    .hljs-symbol {
      color: #86efac;
    }

    .hljs-number,
    .hljs-literal {
      color: #fbbf24;
    }

    .hljs-type,
    .hljs-class .hljs-title {
      color: #67e8f9;
    }

    .hljs-comment,
    .hljs-quote {
      color: #94a3b8;
      font-style: italic;
    }

    .hljs-variable,
    .hljs-template-variable {
      color: #fca5a5;
    }

    .hljs-punctuation,
    .hljs-operator {
      color: #cbd5e1;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 8px 10px;
      border: 1px solid var(--border);
    }

    th {
      background: #f8fafc;
    }

    @media (max-width: 640px) {
      main {
        width: 100%;
        margin: 0;
        padding: 24px 18px;
        border-width: 0;
        border-radius: 0;
      }
    }
  </style>
${customCss ? `  <style>\n${indent(customCss.trim(), 4)}\n  </style>\n` : ""}</head>
<body>
  <main>
${indent(markdownHtml.trim(), 4)}
  </main>
</body>
</html>
`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function indent(value: string, spaces: number): string {
  const prefix = " ".repeat(spaces);
  return value
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}

async function convertMarkdownFile(
  inputFile: string,
  outputFile: string,
  cssFile?: string,
): Promise<void> {
  const markdown = await readFile(inputFile, "utf8");
  const customCss = cssFile ? await readFile(cssFile, "utf8") : undefined;
  const content = await marked.parse(markdown, {
    async: false,
    gfm: true,
    breaks: false,
  });
  const title = path.basename(inputFile);
  const html = renderHtmlDocument(content, title, customCss);

  await mkdir(path.dirname(path.resolve(outputFile)), { recursive: true });
  await writeFile(outputFile, html, "utf8");
}

async function runOnce(options: CliOptions): Promise<void> {
  await convertMarkdownFile(options.inputFile, options.outputFile, options.cssFile);
  console.log(`Converted ${options.inputFile} -> ${options.outputFile}`);
}

async function runWatch(options: CliOptions): Promise<void> {
  await runOnce(options);
  watchFiles(options);
}

function watchFiles(options: CliOptions): void {
  const watchedFiles = [options.inputFile, options.cssFile].filter((file): file is string => Boolean(file));
  console.log(`Watching ${watchedFiles.join(", ")} for changes...`);

  const watcher = chokidar.watch(watchedFiles, {
    ignoreInitial: true,
    usePolling: true,
    interval: 300,
    awaitWriteFinish: {
      stabilityThreshold: 150,
      pollInterval: 50,
    },
  });

  watcher.on("all", async (eventName) => {
    if (eventName !== "add" && eventName !== "change") {
      return;
    }

    try {
      await runOnce(options);
    } catch (error) {
      console.error(formatError(error));
    }
  });

  watcher.on("error", (error) => {
    console.error(formatError(error));
  });
}

async function startServer(outputFile: string): Promise<Server> {
  const outputPath = path.resolve(outputFile);
  const rootDir = path.dirname(outputPath);
  const outputName = path.basename(outputPath);
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://localhost");
      const requestedPath = decodeURIComponent(url.pathname);
      const filePath =
        requestedPath === "/" || requestedPath === `/${outputName}`
          ? outputPath
          : path.resolve(rootDir, `.${requestedPath}`);

      if (!filePath.startsWith(`${rootDir}${path.sep}`) && filePath !== outputPath) {
        response.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
        response.end("Forbidden");
        return;
      }

      const file = await readFile(filePath);
      response.writeHead(200, { "content-type": getContentType(filePath) });
      response.end(file);
    } catch {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to read server address."));
        return;
      }

      console.log(`Serving ${outputName} at http://127.0.0.1:${address.port}/`);
      resolve(server);
    });
  });
}

function getContentType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function main(): Promise<void> {
  try {
    const options = parseArgs(process.argv.slice(2));

    if (options.serve) {
      await runOnce(options);
      await startServer(options.outputFile);
      if (options.watch) {
        watchFiles(options);
      }
      return;
    }

    if (options.watch) {
      await runWatch(options);
      return;
    }

    await runOnce(options);
  } catch (error) {
    console.error(formatError(error));
    console.error("");
    console.error(usage);
    process.exitCode = 1;
  }
}

void main();
