#!/bin/bash

echo "🧪 Testing Bi-Directional Bar Chart Formats"
echo "============================================="

# Test data
TEST_DATA='{"data": [{"category": "Group0", "value": 37, "type": "completed", "group": "Dept 0"}, {"category": "Group0", "value": 9, "type": "uncompleted", "group": "Dept 0"}, {"category": "Group1", "value": 27, "type": "completed", "group": "Dept 1"}, {"category": "Group1", "value": 15, "type": "uncompleted", "group": "Dept 1"}], "title": "Format Test Chart", "positiveTypes": ["completed"], "negativeTypes": ["uncompleted"]}'

echo "1. Testing PNG format..."
PNG_RESULT=$(echo "{\"jsonrpc\": \"2.0\", \"id\": 1, \"method\": \"tools/call\", \"params\": {\"name\": \"generate_bi_directional_bar_chart\", \"arguments\": $(echo $TEST_DATA | jq '. + {format: "png"}')}}}" | node build/index.js 2>/dev/null | jq -r '.result.content[0].text')

if [[ "$PNG_RESULT" =~ ^http://localhost:3210/assets/.+\.png$ ]]; then
    echo "   ✅ PNG format: $PNG_RESULT"
    if curl -s -I "$PNG_RESULT" | head -1 | grep -q "200 OK"; then
        echo "   ✅ PNG file is accessible"
    else
        echo "   ❌ PNG file is not accessible"
    fi
else
    echo "   ❌ PNG format failed"
fi

echo ""
echo "2. Testing HTML-URL format..."
HTML_URL_RESULT=$(echo "{\"jsonrpc\": \"2.0\", \"id\": 1, \"method\": \"tools/call\", \"params\": {\"name\": \"generate_bi_directional_bar_chart\", \"arguments\": $(echo $TEST_DATA | jq '. + {format: "html-url"}')}}}" | node build/index.js 2>/dev/null | jq -r '.result.content[0].text')

if [[ "$HTML_URL_RESULT" =~ ^http://localhost:3210/pages/.+\.html$ ]]; then
    echo "   ✅ HTML-URL format: $HTML_URL_RESULT"
    if curl -s -I "$HTML_URL_RESULT" | head -1 | grep -q "200 OK"; then
        echo "   ✅ HTML page is accessible"
        # Check if it contains G2 chart code
        if curl -s "$HTML_URL_RESULT" | grep -q "G2.*Chart"; then
            echo "   ✅ HTML contains G2 chart code"
        else
            echo "   ❌ HTML does not contain G2 chart code"
        fi
    else
        echo "   ❌ HTML page is not accessible"
    fi
else
    echo "   ❌ HTML-URL format failed"
fi

echo ""
echo "3. Testing HTML (MCP-UI) format..."
HTML_RESULT=$(echo "{\"jsonrpc\": \"2.0\", \"id\": 1, \"method\": \"tools/call\", \"params\": {\"name\": \"generate_bi_directional_bar_chart\", \"arguments\": $(echo $TEST_DATA | jq '. + {format: "html"}')}}}" | node build/index.js 2>/dev/null)

if echo "$HTML_RESULT" | jq -e '.result.content[0].type == "resource"' >/dev/null 2>&1; then
    echo "   ✅ HTML (MCP-UI) format returned resource type"
    
    # Check if it has the right URI pattern
    URI=$(echo "$HTML_RESULT" | jq -r '.result.content[0].resource.uri')
    if [[ "$URI" =~ ^ui://charts-mcp/bi-directional-bar/.+ ]]; then
        echo "   ✅ MCP-UI resource has correct URI: $URI"
    else
        echo "   ❌ MCP-UI resource has incorrect URI: $URI"
    fi
    
    # Check if HTML content contains G2 code
    if echo "$HTML_RESULT" | jq -r '.result.content[0].resource.text' | grep -q "G2.*Chart"; then
        echo "   ✅ MCP-UI resource contains G2 chart code"
    else
        echo "   ❌ MCP-UI resource does not contain G2 chart code"
    fi
else
    echo "   ❌ HTML (MCP-UI) format failed"
fi

echo ""
echo "4. Testing default format (should be html)..."
DEFAULT_RESULT=$(echo "{\"jsonrpc\": \"2.0\", \"id\": 1, \"method\": \"tools/call\", \"params\": {\"name\": \"generate_bi_directional_bar_chart\", \"arguments\": $TEST_DATA}}" | node build/index.js 2>/dev/null)

if echo "$DEFAULT_RESULT" | jq -e '.result.content[0].type == "resource"' >/dev/null 2>&1; then
    echo "   ✅ Default format returns MCP-UI resource (html)"
else
    echo "   ❌ Default format does not return MCP-UI resource"
fi

echo ""
echo "🎉 Format testing complete!"