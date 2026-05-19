# md2html

A Node.js command line tool that converts Markdown files to styled HTML.

## Install

Install dependencies and build the TypeScript source:

```bash
npm install
npm run build
```

You can also link the command locally:

```bash
npm link
```

## Usage

Convert a Markdown file to HTML:

```bash
md2html input.md -o output.html
```

The long output option works too:

```bash
md2html input.md --output output.html
```

If `-o` / `--output` is omitted, the output file is created next to the input file with an `.html` extension:

```bash
md2html input.md
# writes input.html
```

## Watch Mode

Use `--watch` to rebuild automatically when the Markdown file changes:

```bash
md2html input.md -o output.html --watch
```

If you also pass `--css`, watch mode monitors both the Markdown file and the CSS file.

## Custom CSS

Use `--css` to append your own CSS to the generated HTML. The custom CSS is embedded after the default style, so it can override the built-in theme:

```bash
md2html input.md -o output.html --css custom.css
```

## Preview Server

Use `--serve` to generate the HTML and start a local HTTP server for preview:

```bash
md2html input.md -o output.html --serve
```

The server prints a local URL like:

```text
Serving output.html at http://127.0.0.1:54321/
```

Combine `--serve` with `--watch` for automatic rebuilds while previewing:

```bash
md2html input.md -o output.html --css custom.css --watch --serve
```

## Development

Run the TypeScript source directly without building:

```bash
npm run dev -- input.md -o output.html
```

Build the distributable CLI:

```bash
npm run build
```

Run the built CLI directly:

```bash
node dist/cli.js input.md -o output.html
```
