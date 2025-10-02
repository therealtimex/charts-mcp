#!/usr/bin/env tsx
/**
 * Start the renderer server in development mode
 * This server handles html-url and png format generation
 *
 * Usage:
 *   npm run renderer:dev
 *   npm run renderer:dev -- --port 3210
 */

import { startRendererServer } from "../src/renderer/server";

const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const port = portIndex >= 0 ? Number(args[portIndex + 1]) : undefined;

console.log("🚀 Starting Charts MCP Renderer Server...\n");
console.log("This server provides:");
console.log("  • HTML-URL format: Interactive HTML pages");
console.log("  • PNG format: Static image generation");
console.log("");

startRendererServer(port);

console.log("\n✨ Renderer server is ready!");
console.log(`   Listening on http://localhost:${port || 3210}`);
console.log("   Press Ctrl+C to stop\n");
