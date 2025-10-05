#!/bin/bash

echo "🔍 MCP Server Health Check"
echo "=========================="

# Check if renderer server is running
echo "1. Checking renderer server health..."
if curl -s http://localhost:3210/health | grep -q '"ok":true'; then
    echo "   ✅ Renderer server is healthy"
else
    echo "   ❌ Renderer server is not responding"
    exit 1
fi

# Check MCP server tools
echo "2. Checking MCP server tools..."
TOOL_COUNT=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node build/index.js 2>/dev/null | jq -r '.result.tools | length' 2>/dev/null)
if [ "$TOOL_COUNT" -gt 0 ]; then
    echo "   ✅ MCP server has $TOOL_COUNT tools available"
else
    echo "   ❌ MCP server is not responding or has no tools"
    exit 1
fi

# Check bi-directional bar chart tool specifically
echo "3. Checking bi-directional bar chart tool..."
if echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node build/index.js 2>/dev/null | jq -r '.result.tools[].name' | grep -q "generate_bi_directional_bar_chart"; then
    echo "   ✅ bi-directional bar chart tool is available"
else
    echo "   ❌ bi-directional bar chart tool is missing"
    exit 1
fi

# Test chart generation
echo "4. Testing chart generation..."
CHART_URL=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "generate_bi_directional_bar_chart", "arguments": {"data": [{"category": "Test", "value": 10, "type": "positive"}, {"category": "Test", "value": 5, "type": "negative"}], "title": "Health Check", "format": "png"}}}' | node build/index.js 2>/dev/null | jq -r '.result.content[0].text' 2>/dev/null)

if [[ "$CHART_URL" =~ ^http://localhost:3210/assets/.+\.png$ ]]; then
    echo "   ✅ Chart generation successful: $CHART_URL"
    
    # Check if the generated image is accessible
    if curl -s -I "$CHART_URL" | head -1 | grep -q "200 OK"; then
        echo "   ✅ Generated chart is accessible via HTTP"
    else
        echo "   ❌ Generated chart is not accessible"
        exit 1
    fi
else
    echo "   ❌ Chart generation failed"
    exit 1
fi

echo ""
echo "🎉 All health checks passed! MCP server is running properly."