# dev-process-manager documentation site

This directory contains the [Docusaurus](https://docusaurus.io/) website for
`@comet/dev-process-manager`.

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

The site is deployed to **GitHub Pages** by the
[`.github/workflows/deploy-docs.yml`](../.github/workflows/deploy-docs.yml) workflow:

- On push to `main` (when `docs/**` changed), it builds and deploys the site.
- On pull requests it runs the build as a check only (no deploy).
- It can also be triggered manually from the Actions tab.

The site is served from `https://vivid-planet.github.io/dev-process-manager/`, which is
why `baseUrl` is `/dev-process-manager/` in `docusaurus.config.ts`.

One-time setup: in the repository settings under **Settings → Pages**, set the
**Source** to **GitHub Actions**.

## Structure

- `docs/` — documentation content (Markdown).
- `src/pages/` — the landing page.
- `src/css/custom.css` — theme (Dextinity-inspired brand colors and fonts).
- `docusaurus.config.ts` — site configuration.
- `sidebars.ts` — sidebar layout.
- `netlify.toml` — Netlify deployment config.
