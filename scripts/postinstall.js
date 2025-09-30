#!/usr/bin/env node

/**
 * Postinstall script to fix @mcp-ui/server package bug
 * Creates a symlink from index.cjs to index.js to work around missing file
 */

const fs = require('node:fs');
const path = require('node:path');

const mcpUiServerPath = path.join(__dirname, '..', 'node_modules', '@mcp-ui', 'server', 'dist');
const indexJsPath = path.join(mcpUiServerPath, 'index.js');
const indexCjsPath = path.join(mcpUiServerPath, 'index.cjs');

// Check if the directory exists
if (!fs.existsSync(mcpUiServerPath)) {
  console.log('[@realtimex/charts-mcp] @mcp-ui/server not found, skipping postinstall fix');
  process.exit(0);
}

// Check if index.js already exists
if (fs.existsSync(indexJsPath)) {
  console.log('[@realtimex/charts-mcp] @mcp-ui/server index.js already exists, skipping');
  process.exit(0);
}

// Check if index.cjs exists
if (!fs.existsSync(indexCjsPath)) {
  console.error('[@realtimex/charts-mcp] ERROR: @mcp-ui/server index.cjs not found');
  process.exit(1);
}

// Create symlink
try {
  fs.symlinkSync('index.cjs', indexJsPath);
  console.log('[@realtimex/charts-mcp] ✓ Created symlink for @mcp-ui/server (index.js -> index.cjs)');
} catch (error) {
  console.error('[@realtimex/charts-mcp] ERROR: Failed to create symlink:', error.message);
  console.error('[@realtimex/charts-mcp] Trying to copy file instead...');

  try {
    fs.copyFileSync(indexCjsPath, indexJsPath);
    console.log('[@realtimex/charts-mcp] ✓ Copied index.cjs to index.js as fallback');
  } catch (copyError) {
    console.error('[@realtimex/charts-mcp] ERROR: Failed to copy file:', copyError.message);
    process.exit(1);
  }
}