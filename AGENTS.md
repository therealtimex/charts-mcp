# Repository Guidelines

## Project Structure & Module Organization
- Source code lives in `src/` (entry: `src/index.ts`; server: `src/server.ts`).
- Chart definitions in `src/charts/` (kebab-case files, e.g., `flow-diagram.ts`).
- Utilities in `src/utils/`, transports in `src/services/`.
- Tests in `__tests__/` (unit specs and chart schema fixtures).
- Docker assets in `docker/` (SSE and streamable images) and `.github/workflows/` for CI.
- Build output in `build/` (generated; do not edit).

## Build, Test, and Development Commands
- Install: `npm install`
- Build: `npm run build` (cleans, compiles TypeScript, fixes path aliases)
- Start (Inspector): `npm start`
- Run server directly: `node build/index.js -t sse` or `-t streamable`
- Test: `npm test` (Vitest)
- Docker (from `docker/`): `docker compose up -d`

Server identifier: `charts-mcp` (used by MCP clients and registry).

## Coding Style & Naming Conventions
- Language: TypeScript, Node.js 20+ (matches CI).
- Indentation: 2 spaces; quotes: double; enforced by Biome (`biome.json`).
- Run locally: `npx biome lint` and `npx biome format --write` (husky/lint-staged runs on commit).
- Filenames: kebab-case for charts (`src/charts/dual-axes.ts`), camelCase for functions, PascalCase for types/interfaces.
- Do not commit `build/` artifacts.

## Testing Guidelines
- Framework: Vitest.
- Location: `__tests__/`; name tests `*.spec.ts`.
- Charts: keep schema fixtures in `__tests__/charts/*.json` and export via `__tests__/charts/index.ts`.
- Run: `npm test` (CI also runs build + tests). Add meaningful tests for new utilities and chart validation.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat: ...`, `fix: ...`, `chore: ...` (see git history).
- PRs should include: concise description, linked issues, test updates, and examples (e.g., CLI command or JSON payload) when relevant.
- Ensure `npm run build` and `npm test` pass locally; CI must be green.

## Security & Configuration Tips
- Environment variables: `VIS_REQUEST_SERVER` (charts), `MAP_REQUEST_SERVER` (maps), `SERVICE_ID`, `DISABLED_TOOLS`.
- Example: `VIS_REQUEST_SERVER=https://chart.example.com MAP_REQUEST_SERVER=https://map.example.com node build/index.js -t sse`.
- Avoid hardcoding secrets; prefer environment configuration and local `.npmrc` for registry auth when needed.
 - Rendering toggles: set `RENDER_INTERACTIVE=true` (or `RENDER_FORMAT=html`) to return interactive pages by default.

## Map Backend (OSM)
- Map tools render locally via Leaflet. OSM tiles and Nominatim geocoding are used by default.
- Endpoints: `MAP_REQUEST_SERVER=http://localhost:3210/map` (default).
- Affected tools: `generate_district_map`, `generate_path_map`, `generate_pin_map`.
- If maps are not desired, disable via `DISABLED_TOOLS="generate_district_map,generate_path_map,generate_pin_map"`.

## Built-in Renderer
- Local server renders charts and maps and serves images at `http://localhost:${RENDER_PORT}/assets/*` (default 3210).
- Defaults:
  - `VIS_REQUEST_SERVER=http://localhost:3210/chart`
  - `MAP_REQUEST_SERVER=http://localhost:3210/map`
- Interactive mode: pass `"format": "html"` in tool args to receive a URL under `/pages/*` with live, interactive charts/maps.
