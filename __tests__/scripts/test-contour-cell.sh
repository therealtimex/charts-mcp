#!/bin/bash

echo "🗻 Testing Contour Plot - Cell Variant (Heatmap-Style)"
echo "====================================================="

# Test 1: Check if tool is available
echo "1. Checking if generate_contour_plot tool is available..."
TOOL_EXISTS=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node build/index.js 2>/dev/null | jq -r '.result.tools[] | select(.name == "generate_contour_plot") | .name' | head -1)

if [ "$TOOL_EXISTS" = "generate_contour_plot" ]; then
    echo "   ✅ generate_contour_plot tool is available"
else
    echo "   ❌ generate_contour_plot tool is not available"
    exit 1
fi

# Test 2: Test cell variant with PNG format
echo "2. Testing cell variant (heatmap-style) with PNG format..."
CELL_PNG_RESULT=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "generate_contour_plot", "arguments": {"data": [{"x": 0, "y": 0, "z": 10}, {"x": 2, "y": 0, "z": 12}, {"x": 4, "y": 0, "z": 15}, {"x": 0, "y": 2, "z": 15}, {"x": 2, "y": 2, "z": 25}, {"x": 4, "y": 2, "z": 18}, {"x": 0, "y": 4, "z": 12}, {"x": 2, "y": 4, "z": 18}, {"x": 4, "y": 4, "z": 14}, {"x": 0, "y": 6, "z": 8}, {"x": 2, "y": 6, "z": 10}, {"x": 4, "y": 6, "z": 12}, {"x": 6, "y": 0, "z": 18}, {"x": 6, "y": 2, "z": 22}, {"x": 6, "y": 4, "z": 16}, {"x": 6, "y": 6, "z": 14}], "variant": "cell", "title": "Terrain Elevation Map", "axisXTitle": "Longitude", "axisYTitle": "Latitude", "style": {"palette": ["viridis"], "strokeWidth": 0.5, "inset": 0.5}, "format": "png"}}}' | node build/index.js 2>/dev/null | jq -r '.result.content[0].text')

if [[ "$CELL_PNG_RESULT" =~ ^http://localhost:3210/assets/.+\.png$ ]]; then
    echo "   ✅ Cell variant PNG: $CELL_PNG_RESULT"
    if curl -s -I "$CELL_PNG_RESULT" | head -1 | grep -q "200 OK"; then
        echo "   ✅ PNG file is accessible"
    else
        echo "   ❌ PNG file is not accessible"
    fi
else
    echo "   ❌ Cell variant PNG failed: $CELL_PNG_RESULT"
fi

# Test 3: Test HTML format (URL)
echo "3. Testing cell variant with HTML format..."
HTML_RESULT=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "generate_contour_plot", "arguments": {"data": [{"x": 0, "y": 0, "z": 10}, {"x": 2, "y": 0, "z": 15}, {"x": 4, "y": 0, "z": 18}, {"x": 0, "y": 2, "z": 15}, {"x": 2, "y": 2, "z": 30}, {"x": 4, "y": 2, "z": 22}], "variant": "cell", "format": "html"}}}' | node build/index.js 2>/dev/null | jq -r '.result.content[0].text')

if [[ "$HTML_RESULT" =~ ^http://localhost:3210/pages/.+\.html$ ]]; then
    echo "   ✅ HTML format: $HTML_RESULT"
    if curl -s -I "$HTML_RESULT" | head -1 | grep -q "200 OK"; then
        echo "   ✅ HTML page is accessible"
        # Check if HTML contains contour code
        if curl -s "$HTML_RESULT" | grep -E "(cell|contour|viridis)" >/dev/null; then
            echo "   ✅ HTML page contains contour code"
        else
            echo "   ❌ HTML page does not contain contour code"
        fi
    else
        echo "   ❌ HTML page is not accessible"
    fi
else
    echo "   ❌ HTML format failed: $HTML_RESULT"
fi

echo ""
echo "🎉 Contour plot cell variant testing complete!"
echo ""
echo "📊 Generated assets:"
echo "   PNG: $CELL_PNG_RESULT"
