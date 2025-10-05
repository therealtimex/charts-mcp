#!/bin/bash

echo "🗺️ Testing Bubble Map Tool Functionality"
echo "========================================"

# Test 1: Check if tool is available
echo "1. Checking if generate_bubble_map tool is available..."
TOOL_EXISTS=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node build/index.js 2>/dev/null | jq -r '.result.tools[] | select(.name == "generate_bubble_map") | .name')

if [ "$TOOL_EXISTS" = "generate_bubble_map" ]; then
    echo "   ✅ generate_bubble_map tool is available"
else
    echo "   ❌ generate_bubble_map tool is not available"
    exit 1
fi

# Test 2: Test PNG format
echo "2. Testing PNG format..."
PNG_RESULT=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "generate_bubble_map", "arguments": {"title": "Global Cities GDP", "data": [{"name": "New York", "lng": -74.0059, "lat": 40.7128, "size": 1700, "group": "North America"}, {"name": "London", "lng": -0.1276, "lat": 51.5074, "size": 653, "group": "Europe"}, {"name": "Tokyo", "lng": 139.6917, "lat": 35.6895, "size": 1617, "group": "Asia"}, {"name": "Beijing", "lng": 116.4074, "lat": 39.9042, "size": 4027, "group": "Asia"}], "scale": {"size": {"range": [8, 40]}}, "style": {"fillOpacity": 0.8}, "format": "png"}}}' | node build/index.js 2>/dev/null | jq -r '.result.content[0].text')

if [[ "$PNG_RESULT" =~ ^http://localhost:3210/assets/.+\.png$ ]]; then
    echo "   ✅ PNG format: $PNG_RESULT"
    if curl -s -I "$PNG_RESULT" | head -1 | grep -q "200 OK"; then
        echo "   ✅ PNG file is accessible"
    else
        echo "   ❌ PNG file is not accessible"
    fi
else
    echo "   ❌ PNG format failed: $PNG_RESULT"
fi

# Test 3: Test HTML format (MCP-UI resource)
echo "3. Testing HTML (MCP-UI) format..."
HTML_RESULT=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "generate_bubble_map", "arguments": {"title": "Interactive Bubble Map", "data": [{"name": "Paris", "lng": 2.3522, "lat": 48.8566, "size": 709, "group": "Europe"}, {"name": "Sydney", "lng": 151.2093, "lat": -33.8688, "size": 337, "group": "Oceania"}], "format": "html"}}}' | node build/index.js 2>/dev/null)

if echo "$HTML_RESULT" | jq -e '.result.content[0].type == "resource"' >/dev/null 2>&1; then
    echo "   ✅ HTML (MCP-UI) format returned resource type"
    
    # Check URI pattern
    URI=$(echo "$HTML_RESULT" | jq -r '.result.content[0].resource.uri')
    if [[ "$URI" =~ ^ui://charts-mcp/bubble-map/.+ ]]; then
        echo "   ✅ MCP-UI resource has correct URI: $URI"
    else
        echo "   ❌ MCP-UI resource has incorrect URI: $URI"
    fi
    
    # Check if HTML content contains geo/map code
    if echo "$HTML_RESULT" | jq -r '.result.content[0].resource.text' | grep -E "(geoView|lng.*lat|bubble)" >/dev/null; then
        echo "   ✅ MCP-UI resource contains geo/map code"
    else
        echo "   ❌ MCP-UI resource does not contain geo/map code"
    fi
else
    echo "   ❌ HTML (MCP-UI) format failed"
fi

# Test 4: Test with multi-layer data
echo "4. Testing multi-layer bubble map..."
MULTI_LAYER_RESULT=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "generate_bubble_map", "arguments": {"title": "Multi-Layer Cities", "layers": [{"name": "Major Cities", "data": [{"name": "New York", "lng": -74.0059, "lat": 40.7128, "size": 1700, "group": "Tier 1"}]}, {"name": "Secondary Cities", "data": [{"name": "Boston", "lng": -71.0589, "lat": 42.3601, "size": 400, "group": "Tier 2"}]}], "format": "png"}}}' | node build/index.js 2>/dev/null | jq -r '.result.content[0].text')

if [[ "$MULTI_LAYER_RESULT" =~ ^http://localhost:3210/assets/.+\.png$ ]]; then
    echo "   ✅ Multi-layer bubble map: $MULTI_LAYER_RESULT"
else
    echo "   ❌ Multi-layer bubble map failed: $MULTI_LAYER_RESULT"
fi

# Test 5: Test error handling with invalid data
echo "5. Testing error handling..."
ERROR_RESULT=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "generate_bubble_map", "arguments": {"title": "Invalid Data", "data": [{"name": "Invalid", "size": 100}]}}}' | node build/index.js 2>/dev/null | jq -r '.error.message // "no error"')

if [[ "$ERROR_RESULT" != "no error" ]]; then
    echo "   ✅ Error handling works: $ERROR_RESULT"
else
    echo "   ❌ Error handling failed - should have caught missing lng/lat"
fi

echo ""
echo "🎉 Bubble Map tool testing complete!"
echo ""
echo "📊 Generated assets:"
echo "   PNG: $PNG_RESULT"
echo "   Multi-layer: $MULTI_LAYER_RESULT"