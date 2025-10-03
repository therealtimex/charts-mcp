#!/bin/bash

echo "📈 Testing Contour Plot - Line Variant (Contour Outline Chart)"
echo "=============================================================="

# Test 1: Check if tool is available
echo "1. Checking if generate_contour_plot tool is available..."
TOOL_EXISTS=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node build/index.js 2>/dev/null | jq -r '.result.tools[] | select(.name == "generate_contour_plot") | .name' | head -1)

if [ "$TOOL_EXISTS" = "generate_contour_plot" ]; then
    echo "   ✅ generate_contour_plot tool is available"
else
    echo "   ❌ generate_contour_plot tool is not available"
    exit 1
fi

# Test 2: Test line variant with PNG format
echo "2. Testing line variant (contour outline chart) with PNG format..."
LINE_PNG_RESULT=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "generate_contour_plot", "arguments": {"data": [{"x": 25, "y": 25, "level": 20, "lineId": "line_20"}, {"x": 26, "y": 25, "level": 20, "lineId": "line_20"}, {"x": 27, "y": 26, "level": 20, "lineId": "line_20"}, {"x": 27, "y": 27, "level": 20, "lineId": "line_20"}, {"x": 26, "y": 28, "level": 20, "lineId": "line_20"}, {"x": 25, "y": 28, "level": 20, "lineId": "line_20"}, {"x": 24, "y": 27, "level": 20, "lineId": "line_20"}, {"x": 24, "y": 26, "level": 20, "lineId": "line_20"}, {"x": 25, "y": 25, "level": 20, "lineId": "line_20"}, {"x": 25, "y": 25, "level": 40, "lineId": "line_40"}, {"x": 28, "y": 25, "level": 40, "lineId": "line_40"}, {"x": 30, "y": 27, "level": 40, "lineId": "line_40"}, {"x": 30, "y": 30, "level": 40, "lineId": "line_40"}, {"x": 28, "y": 32, "level": 40, "lineId": "line_40"}, {"x": 25, "y": 32, "level": 40, "lineId": "line_40"}, {"x": 22, "y": 30, "level": 40, "lineId": "line_40"}, {"x": 22, "y": 27, "level": 40, "lineId": "line_40"}, {"x": 25, "y": 25, "level": 40, "lineId": "line_40"}, {"x": 25, "y": 25, "level": 60, "lineId": "line_60"}, {"x": 30, "y": 25, "level": 60, "lineId": "line_60"}, {"x": 33, "y": 28, "level": 60, "lineId": "line_60"}, {"x": 33, "y": 33, "level": 60, "lineId": "line_60"}, {"x": 30, "y": 36, "level": 60, "lineId": "line_60"}, {"x": 25, "y": 36, "level": 60, "lineId": "line_60"}, {"x": 20, "y": 33, "level": 60, "lineId": "line_60"}, {"x": 20, "y": 28, "level": 60, "lineId": "line_60"}, {"x": 25, "y": 25, "level": 60, "lineId": "line_60"}], "variant": "line", "title": "Elevation (m)", "axisXTitle": "Distance (km)", "axisYTitle": "Distance (km)", "style": {"palette": ["oranges"], "strokeWidth": 2, "strokeOpacity": 0.8}, "format": "png"}}}' | node build/index.js 2>/dev/null | jq -r '.result.content[0].text')

if [[ "$LINE_PNG_RESULT" =~ ^http://localhost:3210/assets/.+\.png$ ]]; then
    echo "   ✅ Line variant PNG: $LINE_PNG_RESULT"
    if curl -s -I "$LINE_PNG_RESULT" | head -1 | grep -q "200 OK"; then
        echo "   ✅ PNG file is accessible"
    else
        echo "   ❌ PNG file is not accessible"
    fi
else
    echo "   ❌ Line variant PNG failed: $LINE_PNG_RESULT"
fi

# Test 3: Test HTML format (URL)
echo "3. Testing line variant with HTML format..."
HTML_RESULT=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "generate_contour_plot", "arguments": {"data": [{"x": 25, "y": 25, "level": 20, "lineId": "line_20"}, {"x": 30, "y": 25, "level": 20, "lineId": "line_20"}, {"x": 30, "y": 30, "level": 20, "lineId": "line_20"}, {"x": 25, "y": 30, "level": 20, "lineId": "line_20"}, {"x": 25, "y": 25, "level": 20, "lineId": "line_20"}], "variant": "line", "format": "html"}}}' | node build/index.js 2>/dev/null | jq -r '.result.content[0].text')

if [[ "$HTML_RESULT" =~ ^http://localhost:3210/pages/.+\.html$ ]]; then
    echo "   ✅ HTML format: $HTML_RESULT"
    if curl -s -I "$HTML_RESULT" | head -1 | grep -q "200 OK"; then
        echo "   ✅ HTML page is accessible"
        # Check if HTML contains line contour code
        if curl -s "$HTML_RESULT" | grep -E "(line|level|lineId)" >/dev/null; then
            echo "   ✅ HTML page contains line contour code"
        else
            echo "   ❌ HTML page does not contain line contour code"
        fi
    else
        echo "   ❌ HTML page is not accessible"
    fi
else
    echo "   ❌ HTML format failed: $HTML_RESULT"
fi

echo ""
echo "🎉 Contour plot line variant testing complete!"
echo ""
echo "📊 Generated assets:"
echo "   PNG: $LINE_PNG_RESULT"
