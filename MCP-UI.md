# MCP-UI Integration

charts-mcp now supports [MCP-UI](https://mcpui.dev/) for rendering interactive charts directly in MCP clients!

## What is MCP-UI?

MCP-UI enables MCP servers to return rich, interactive UI components that render directly in AI clients, providing a better user experience than simple URLs.

## Features

- **Interactive Charts**: Charts render as interactive HTML directly in the client
- **Smart Mode Selection**: Automatically chooses between inline (blob) and server-based rendering
- **Size Optimization**: Small charts (<100KB) are embedded inline, large charts use server URLs
- **Backward Compatible**: URL mode still available for clients that don't support MCP-UI

## Configuration

### Environment Variables

**RENDER_MODE** (default: `ui-resource`)
- `ui-resource`: Return charts as MCP-UI resources (recommended)
- `url`: Return charts as URLs (legacy mode)
- `auto`: Automatically choose based on client capabilities

**UI_RESOURCE_MODE** (default: `auto`)
- `auto`: Automatically choose blob/server based on chart size
- `blob`: Always embed HTML inline (for small charts)
- `server`: Always use server URLs (for large charts)

### Example Configuration

```bash
# Use MCP-UI with automatic mode selection (default)
RENDER_MODE=ui-resource
UI_RESOURCE_MODE=auto

# Force inline HTML for all charts
RENDER_MODE=ui-resource
UI_RESOURCE_MODE=blob

# Use legacy URL mode
RENDER_MODE=url
```

## How It Works

1. When a chart tool is called, charts-mcp generates the chart HTML
2. If the HTML is small (<100KB), it's embedded directly in the MCP response
3. If the HTML is large (>100KB), it's served via the renderer server and a URL is returned
4. MCP clients that support MCP-UI will render the chart interactively

## Client Compatibility

MCP-UI is supported by:
- MCP Inspector
- Claude Desktop (with MCP-UI support)
- Other MCP clients implementing the MCP-UI specification

For clients without MCP-UI support, set `RENDER_MODE=url` to use the legacy URL-based rendering.

## Technical Details

charts-mcp uses `@mcp-ui/server` v5.11.0 to create UI resources. The integration includes:

- **Blob mode**: HTML embedded as `text/html` with MIME type
- **Server mode**: URL embedded as `text/uri-list` with MIME type
- **Metadata**: Title and description for better UX
- **Size threshold**: 100KB boundary for automatic mode selection

## Known Issues

The `@mcp-ui/server@5.11.0` package has a packaging bug where `index.js` is missing. charts-mcp includes an automatic postinstall script that creates a symlink to fix this issue.

If you encounter import errors, run:
```bash
npm install
```

The postinstall script will automatically fix the issue.

## Migration from URL Mode

If you're currently using URL mode, migrating to MCP-UI is simple:

1. Remove any `RENDER_MODE=url` environment variable (or change to `ui-resource`)
2. Ensure your MCP client supports MCP-UI
3. Restart your MCP server

Charts will now render interactively!