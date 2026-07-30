# dev-process-manager documentation site

This directory contains the [Docusaurus](https://docusaurus.io/) website for
`dev-process-manager`.

## Local development

```bash
cd docs
npm install
npm start
```

This starts a local dev server at `http://localhost:3000/` with hot reloading.

## Build

```bash
npm run build
```

The static site is generated into the `build/` directory and can be served with any
static host:

```bash
npm run serve
```

## Deployment

The site is deployed on [Netlify](https://www.netlify.com/), mirroring the Comet DXP
docs setup. The `netlify.toml` in this folder defines the build:

- **command:** `npm ci && npm run build`
- **publish:** `build`
- Builds are skipped when nothing under `docs/` changed.

To connect it on Netlify:

1. Create a new Netlify site from the `vivid-planet/dev-process-manager` repository.
2. Set the **Base directory** to `docs` (so Netlify reads this `netlify.toml`).
3. Netlify then builds production deploys on pushes to `main` and deploy previews on
   pull requests automatically.

After the production domain is known, update `url` in `docusaurus.config.ts`.

## Structure

- `docs/` — documentation content (Markdown).
- `src/pages/` — the landing page.
- `src/css/custom.css` — theme (Dextinity-inspired brand colors and fonts).
- `docusaurus.config.ts` — site configuration.
- `sidebars.ts` — sidebar layout.
- `netlify.toml` — Netlify deployment config.
