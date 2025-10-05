#!/bin/bash

echo "🎯 Testing Chord Diagram with G2 Example Data"
echo "============================================="

# G2 Example Data converted to MCP format
G2_DATA='[
  {"source": "Beijing", "target": "Tianjin", "value": 30},
  {"source": "Beijing", "target": "Shanghai", "value": 80},
  {"source": "Beijing", "target": "Hebei", "value": 46},
  {"source": "Beijing", "target": "Liaoning", "value": 49},
  {"source": "Beijing", "target": "Heilongjiang", "value": 69},
  {"source": "Beijing", "target": "Jilin", "value": 19},
  {"source": "Tianjin", "target": "Hebei", "value": 62},
  {"source": "Tianjin", "target": "Liaoning", "value": 82},
  {"source": "Tianjin", "target": "Shanghai", "value": 16},
  {"source": "Shanghai", "target": "Heilongjiang", "value": 16},
  {"source": "Hebei", "target": "Heilongjiang", "value": 76},
  {"source": "Hebei", "target": "Inner Mongolia", "value": 24},
  {"source": "Inner Mongolia", "target": "Beijing", "value": 32}
]'

G2_COLORS='["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"]'

echo "1. Testing PNG format with G2 example data..."
PNG_RESULT=$(echo "{\"jsonrpc\": \"2.0\", \"id\": 1, \"method\": \"tools/call\", \"params\": {\"name\": \"generate_chord\", \"arguments\": {\"title\": \"G2 Example - Chinese Provinces\", \"data\": $G2_DATA, \"scale\": {\"color\": {\"range\": $G2_COLORS}}, \"style\": {\"labelFontSize\": 15, \"linkFillOpacity\": 0.6, \"nodeWidthRatio\": 0.05}, \"format\": \"png\"}}}" | node build/index.js 2>/dev/null | jq -r '.result.content[0].text')

if [[ "$PNG_RESULT" =~ ^http://localhost:3210/assets/.+\.png$ ]]; then
    echo "   ✅ PNG with G2 data: $PNG_RESULT"
    if curl -s -I "$PNG_RESULT" | head -1 | grep -q "200 OK"; then
        echo "   ✅ PNG file is accessible"
    else
        echo "   ❌ PNG file is not accessible"
    fi
else
    echo "   ❌ PNG generation failed: $PNG_RESULT"
fi

echo ""
echo "2. Testing HTML format with G2 example data..."
HTML_RESULT=$(echo "{\"jsonrpc\": \"2.0\", \"id\": 1, \"method\": \"tools/call\", \"params\": {\"name\": \"generate_chord\", \"arguments\": {\"title\": \"G2 Interactive - Chinese Provinces\", \"data\": $G2_DATA, \"scale\": {\"color\": {\"range\": $G2_COLORS}}, \"style\": {\"labelFontSize\": 15, \"linkFillOpacity\": 0.6, \"nodeWidthRatio\": 0.05}, \"format\": \"html\"}}}" | node build/index.js 2>/dev/null | jq -r '.result.content[0].text')

if [[ "$HTML_RESULT" =~ ^http://localhost:3210/pages/.+\.html$ ]]; then
    echo "   ✅ HTML with G2 data: $HTML_RESULT"
    if curl -s -I "$HTML_RESULT" | head -1 | grep -q "200 OK"; then
        echo "   ✅ HTML page is accessible"
        
        # Check for G2 example cities in the HTML
        if curl -s "$HTML_RESULT" | grep -q "Beijing.*Tianjin.*Shanghai"; then
            echo "   ✅ HTML contains G2 example cities"
        else
            echo "   ❌ HTML missing G2 example cities"
        fi
        
        # Check for G2 styling parameters
        HTML_CONTENT=$(curl -s "$HTML_RESULT")
        if echo "$HTML_CONTENT" | grep -q "labelFontSize.*15"; then
            echo "   ✅ HTML contains labelFontSize: 15"
        else
            echo "   ❌ HTML missing labelFontSize styling"
        fi
        
        if echo "$HTML_CONTENT" | grep -q "linkFillOpacity.*0.6"; then
            echo "   ✅ HTML contains linkFillOpacity: 0.6"
        else
            echo "   ❌ HTML missing linkFillOpacity styling"
        fi
        
        # Check for G2 color palette
        if echo "$HTML_CONTENT" | grep -q "#4e79a7.*#f28e2c"; then
            echo "   ✅ HTML contains G2 color palette"
        else
            echo "   ❌ HTML missing G2 color palette"
        fi
        
    else
        echo "   ❌ HTML page is not accessible"
    fi
else
    echo "   ❌ HTML generation failed: $HTML_RESULT"
fi

echo ""
echo "3. Testing data completeness..."
TOTAL_CONNECTIONS=$(echo "$G2_DATA" | jq 'length')
echo "   📊 Total connections in G2 example: $TOTAL_CONNECTIONS"

UNIQUE_SOURCES=$(echo "$G2_DATA" | jq -r '.[].source' | sort -u | wc -l)
UNIQUE_TARGETS=$(echo "$G2_DATA" | jq -r '.[].target' | sort -u | wc -l)
ALL_NODES=$(echo "$G2_DATA" | jq -r '.[].source, .[].target' | sort -u | wc -l)

echo "   📊 Unique sources: $UNIQUE_SOURCES"
echo "   📊 Unique targets: $UNIQUE_TARGETS" 
echo "   📊 Total unique nodes: $ALL_NODES"

echo ""
echo "4. Listing all nodes in G2 example:"
echo "$G2_DATA" | jq -r '.[].source, .[].target' | sort -u | while read node; do
    echo "   • $node"
done

echo ""
echo "🎉 G2 Chord Example Test Complete!"
echo ""
echo "📊 Generated Assets:"
echo "   PNG: $PNG_RESULT"
echo "   HTML: $HTML_RESULT"
echo ""
echo "💡 You can open the HTML URL in your browser to see the interactive G2 chord diagram!"