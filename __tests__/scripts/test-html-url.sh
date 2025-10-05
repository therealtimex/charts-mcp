#!/bin/bash

echo "🧪 Testing HTML-URL Format for Bi-Directional Bar Chart"
echo "======================================================="

# Generate HTML-URL
echo "1. Generating HTML-URL..."
HTML_URL=$(echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "generate_bi_directional_bar_chart", "arguments": {"data": [{"category": "Sales", "value": 85, "type": "completed", "group": "Q1"}, {"category": "Sales", "value": 15, "type": "uncompleted", "group": "Q1"}, {"category": "Marketing", "value": 70, "type": "completed", "group": "Q1"}, {"category": "Marketing", "value": 30, "type": "uncompleted", "group": "Q1"}], "title": "Department Performance Q1", "positiveTypes": ["completed"], "negativeTypes": ["uncompleted"], "format": "html-url"}}}' | node build/index.js 2>/dev/null | jq -r '.result.content[0].text')

echo "   Generated URL: $HTML_URL"

# Test accessibility
echo "2. Testing accessibility..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HTML_URL")
if [ "$HTTP_STATUS" = "200" ]; then
    echo "   ✅ HTML page is accessible (HTTP $HTTP_STATUS)"
else
    echo "   ❌ HTML page is not accessible (HTTP $HTTP_STATUS)"
    exit 1
fi

# Test content
echo "3. Testing content..."
CONTENT=$(curl -s "$HTML_URL")

if echo "$CONTENT" | grep -q "Department Performance Q1"; then
    echo "   ✅ Title is present in HTML"
else
    echo "   ❌ Title is missing from HTML"
fi

if echo "$CONTENT" | grep -q "const { Chart } = G2"; then
    echo "   ✅ G2 Chart code is present"
else
    echo "   ❌ G2 Chart code is missing"
fi

if echo "$CONTENT" | grep -q "bi-directional\|interval\|transpose"; then
    echo "   ✅ Chart configuration is present"
else
    echo "   ❌ Chart configuration is missing"
fi

if echo "$CONTENT" | grep -q "completed.*uncompleted"; then
    echo "   ✅ Data types are present in code"
else
    echo "   ❌ Data types are missing from code"
fi

echo ""
echo "4. HTML page details:"
echo "   URL: $HTML_URL"
echo "   Content-Type: $(curl -s -I "$HTML_URL" | grep -i content-type | cut -d' ' -f2-)"
echo "   Content-Length: $(curl -s -I "$HTML_URL" | grep -i content-length | cut -d' ' -f2-)"

echo ""
echo "🎉 HTML-URL format test complete!"
echo ""
echo "💡 You can open this URL in your browser to see the interactive chart:"
echo "   $HTML_URL"