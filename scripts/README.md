# Scripts

This directory contains utility scripts for development and testing.

## Available Scripts

### `start-renderer.ts`

Starts the renderer server for development and testing.

**Usage:**
```bash
npm run renderer:dev
npm run renderer:dev -- --port 3210
```

**What it does:**
- Starts an Express server on port 3210 (default)
- Provides `/chart` endpoint for chart rendering
- Provides `/map` endpoint for map rendering
- Serves static assets from `.cache/renderer/`
- Generates HTML-URL and PNG formats

**When to use:**
- Testing `html-url` and `png` output formats
- Running `render-examples.ts` script
- Local development with URL-based output

---

### `render-examples.ts`

Generates all three output formats for each example chart.

**Usage:**
```bash
# Start renderer server first
npm run renderer:dev

# In another terminal
npm run render-examples
```

**What it does:**
- Reads all examples from `examples/charts/` and `examples/maps/`
- For each example, generates:
  - **HTML blob**: Self-contained HTML in `test-outputs/html/`
  - **HTML-URL**: Server URL in `test-outputs/html-url/`
  - **PNG**: Image URL in `test-outputs/png/`
- Creates an interactive gallery at `test-outputs/index.html`

**Output:**
```
test-outputs/
├── html/
│   ├── bar.basic.html
│   ├── pie.basic.html
│   └── ...
├── html-url/
│   ├── bar.basic.txt (contains URL)
│   ├── pie.basic.txt
│   └── ...
├── png/
│   ├── bar.basic.txt (contains URL)
│   ├── pie.basic.txt
│   └── ...
└── index.html (interactive gallery)
```

**When to use:**
- Visual regression testing
- Manual QA of chart rendering
- Verifying all three output formats work
- Before releases to validate examples

**See also:** [`docs/VISUAL_TESTING.md`](../docs/VISUAL_TESTING.md) for detailed guide

---

### `postinstall.js`

Runs after `npm install` to set up the environment.

**Usage:**
Runs automatically during `npm install`

**What it does:**
- Creates necessary cache directories
- Sets up initial configuration
- Validates installation

---

## Development Workflow

### Visual Testing Workflow

1. **Start renderer server:**
   ```bash
   npm run renderer:dev
   ```

2. **Add/modify examples:**
   ```bash
   # Edit examples/charts/*.json
   vim examples/charts/bar.advanced.json
   ```

3. **Validate schemas:**
   ```bash
   npm test
   ```

4. **Generate test renders:**
   ```bash
   npm run render-examples
   ```

5. **Review gallery:**
   ```bash
   open test-outputs/index.html
   ```

### Adding New Scripts

When adding a new script:

1. Create `scripts/my-script.ts`
2. Add shebang: `#!/usr/bin/env tsx`
3. Add npm script in `package.json`:
   ```json
   "scripts": {
     "my-script": "tsx scripts/my-script.ts"
   }
   ```
4. Document in this README

## Environment Variables

Scripts respect these environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `RENDER_PORT` | `3210` | Port for renderer server |
| `RENDER_PUBLIC_BASE` | `http://localhost:{port}` | Public base URL for generated links |
| `UI_RESOURCE_MODE` | `auto` | MCP-UI resource mode (`auto`, `blob`, `server`) |
| `RENDER_MODE` | `ui-resource` | Legacy render mode (`url`, `ui-resource`, `auto`) |

## Tips

- **Use `tsx` for development**: Runs TypeScript directly without building
- **Check logs**: Renderer server logs to stderr by design (MCP protocol uses stdout)
- **Clean outputs**: `rm -rf test-outputs/` to regenerate from scratch
- **Parallel development**: Run renderer server in one terminal, develop in another

## Troubleshooting

**Script won't run:**
```bash
# Make sure tsx is installed
npm install

# Make script executable (Unix/Linux/Mac)
chmod +x scripts/my-script.ts
```

**Renderer server port in use:**
```bash
# Use custom port
npm run renderer:dev -- --port 3211
```

**Can't find module errors:**
```bash
# Build the project first
npm run build

# Or use tsx to run TypeScript directly
npx tsx scripts/my-script.ts
```

---

For more information, see:
- [Visual Testing Guide](../docs/VISUAL_TESTING.md)
- [Main README](../README.md)
