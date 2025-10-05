#!/bin/bash

echo "🔗 Testing Chord Diagram Tool Functionality"
echo "==========================================="

# Test 1: Check if tool is available
echo "1. Checking if generate_chord tool is available..."
TOOL_EXISTS=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node build/index.js 2>/dev/null | jq -r '.result.tools[] | select(.name == "generate_chord") | .name')

if [ "$TOOL_EXISTS" = "generate_chord" ]; then
    echo "   ✅ generate_chord tool is available"
else
    echo "   ❌ generate_chord tool is not available"
    exit 1
fi

# Test 2: Test PNG format with migration data
echo "2. Testing PNG format with migration flow data..."
PNG_RESULT=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "generate_chord", "arguments": {"title": "Migration Flow Between Regions", "data": [{"source": "North", "target": "South", "value": 15}, {"source": "North", "target": "East", "value": 10}, {"source": "South", "target": "North", "value": 8}, {"source": "South", "target": "West", "value": 12}, {"source": "East", "target": "North", "value": 5}, {"source": "East", "target": "West", "value": 18}, {"source": "West", "target": "South", "value": 14}, {"source": "West", "target": "East", "value": 9}], "format": "png"}}}' | node build/index.js 2>/dev/null | jq -r '.result.content[0].text')

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
HTML_RESULT=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "generate_chord", "arguments": {"title": "Interactive Chord Diagram", "data": [{"source": "A", "target": "B", "value": 20}, {"source": "B", "target": "C", "value": 15}, {"source": "C", "target": "A", "value": 10}], "format": "html"}}}' | node build/index.js 2>/dev/null)

if echo "$HTML_RESULT" | jq -e '.result.content[0].type == "resource"' >/dev/null 2>&1; then
    echo "   ✅ HTML (MCP-UI) format returned resource type"
    
    # Check URI pattern
    URI=$(echo "$HTML_RESULT" | jq -r '.result.content[0].resource.uri')
    if [[ "$URI" =~ ^ui://charts-mcp/chord/.+ ]]; then
        echo "   ✅ MCP-UI resource has correct URI: $URI"
    else
        echo "   ❌ MCP-UI resource has incorrect URI: $URI"
    fi
    
    # Check if HTML content contains chord-specific code
    if echo "$HTML_RESULT" | jq -r '.result.content[0].resource.text' | grep -E "(chord|source.*target)" >/dev/null; then
        echo "   ✅ MCP-UI resource contains chord diagram code"
    else
        echo "   ❌ MCP-UI resource does not contain chord diagram code"
    fi
else
    echo "   ❌ HTML (MCP-UI) format failed"
fi

# Test 4: Test HTML-URL format
echo "4. Testing HTML-URL format..."
HTML_URL_RESULT=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "generate_chord", "arguments": {"title": "Trade Flow Analysis", "data": [{"source": "USA", "target": "China", "value": 120}, {"source": "China", "target": "USA", "value": 100}, {"source": "USA", "target": "EU", "value": 80}, {"source": "EU", "target": "USA", "value": 75}], "format": "html-url"}}}' | node build/index.js 2>/dev/null | jq -r '.result.content[0].text')

if [[ "$HTML_URL_RESULT" =~ ^http://localhost:3210/pages/.+\.html$ ]]; then
    echo "   ✅ HTML-URL format: $HTML_URL_RESULT"
    if curl -s -I "$HTML_URL_RESULT" | head -1 | grep -q "200 OK"; then
        echo "   ✅ HTML page is accessible"
        # Check if it contains chord-specific content
        if curl -s "$HTML_URL_RESULT" | grep -E "(chord|source.*target)" >/dev/null; then
            echo "   ✅ HTML contains chord diagram code"
        else
            echo "   ❌ HTML does not contain chord diagram code"
        fi
    else
        echo "   ❌ HTML page is not accessible"
    fi
else
    echo "   ❌ HTML-URL format failed: $HTML_URL_RESULT"
fi

# Test 5: Test with custom nodes and styling
echo "5. Testing with custom nodes and styling..."
CUSTOM_RESULT=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "generate_chord", "arguments": {"title": "Custom Styled Chord", "data": [{"source": "Node1", "target": "Node2", "value": 25}], "nodes": [{"id": "Node1", "label": "First Node"}, {"id": "Node2", "label": "Second Node"}], "style": {"labelFontSize": 14, "linkFillOpacity": 0.7}, "format": "png"}}}' | node build/index.js 2>/dev/null | jq -r '.result.content[0].text')

if [[ "$CUSTOM_RESULT" =~ ^http://localhost:3210/assets/.+\.png$ ]]; then
    echo "   ✅ Custom styling: $CUSTOM_RESULT"
else
    echo "   ❌ Custom styling failed: $CUSTOM_RESULT"
fi

# Test 6: Test error handling with invalid data
echo "6. Testing error handling..."
ERROR_RESULT=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "generate_chord", "arguments": {"title": "Invalid Data", "data": [{"source": "A", "value": 10}]}}}' | node build/index.js 2>/dev/null | jq -r '.error.message // "no error"')

if [[ "$ERROR_RESULT" != "no error" ]]; then
    echo "   ✅ Error handling works: $ERROR_RESULT"
else
    echo "   ❌ Error handling failed - should have caught missing target"
fi

echo ""
echo "🎉 Chord diagram tool testing complete!"
echo ""
echo "📊 Generated assets:"
echo "   PNG: $PNG_RESULT"
echo "   HTML-URL: $HTML_URL_RESULT"
echo "   Custom: $CUSTOM_RESULT"