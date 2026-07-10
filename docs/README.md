# dev-process-manager documentation site

This directory contains the [Docusaurus](https://docusaurus.io/) website for
`@comet/dev-process-manager`.

## Local development

```bash
cd docs
npm install
npm start
```

This starts a local dev server at `http://localhost:3000/dev-process-manager/` with hot
reloading.

## Build

```bash
npm run build
```

The static site is generated into the `build/` directory and can be served with any
static host:

```bash
npm run serve
```

## Structure

- `docs/` — documentation content (Markdown).
- `src/pages/` — the landing page.
- `src/css/custom.css` — theme (Dextinity-inspired brand colors and fonts).
- `docusaurus.config.ts` — site configuration.
- `sidebars.ts` — sidebar layout.
