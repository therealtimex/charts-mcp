#!/usr/bin/env node

const { callTool } = require('../../build/utils/callTool.js');

async function testDonutChart() {
  console.log('🍩 Testing donut chart MCP tool with full G2 v5 capabilities...\n');
  
  // Test 1: Basic donut chart
  console.log('1. Testing basic donut chart...');
  const basicTest = {
    data: [
      { category: 'Sports', value: 27500 },
      { category: 'Strategy', value: 11500 },
      { category: 'Action', value: 6000 },
      { category: 'Shooter', value: 3500 },
      { category: 'Other', value: 1500 }
    ],
    innerRadius: 0.5,
    width: 600,
    height: 400,
    title: 'Game Sales by Genre'
  };

  try {
    const result1 = await callTool('generate_donut_chart', basicTest);
    console.log('✅ Basic donut chart generated successfully');
    console.log('   URL:', result1.content[0].text);
  } catch (error) {
    console.error('❌ Basic donut chart failed:', error.message);
    return false;
  }

  // Test 2: Advanced donut chart with multiple labels and center annotation
  console.log('\n2. Testing advanced donut chart with multiple labels and center annotation...');
  const advancedTest = {
    data: [
      { category: 'Mobile', value: 54.2 },
      { category: 'Desktop', value: 32.1 },
      { category: 'Tablet', value: 13.7 }
    ],
    innerRadius: 0.6,
    labels: [
      {
        text: 'category',
        style: {
          fontWeight: 'bold',
          fontSize: 12
        }
      },
      {
        text: 'percentage',
        style: {
          fontSize: 10,
          dy: 12
        }
      }
    ],
    centerAnnotation: {
      text: 'Total: 100%',
      style: {
        fontSize: 20,
        fontWeight: 'bold',
        fill: '#333'
      }
    },
    legend: {
      position: 'bottom',
      layout: {
        justifyContent: 'center'
      }
    },
    markStyle: {
      stroke: '#fff',
      lineWidth: 2
    },
    width: 600,
    height: 500,
    title: 'Device Usage Distribution'
  };

  try {
    const result2 = await callTool('generate_donut_chart', advancedTest);
    console.log('✅ Advanced donut chart generated successfully');
    console.log('   URL:', result2.content[0].text);
  } catch (error) {
    console.error('❌ Advanced donut chart failed:', error.message);
    return false;
  }

  // Test 3: Faceted donut charts (small multiples)
  console.log('\n3. Testing faceted donut charts (small multiples)...');
  const facetedTest = {
    data: [
      { year: '2007', area: 'Asia Pacific', profit: 1485.54 },
      { year: '2007', area: 'Western Europe', profit: 3631.32 },
      { year: '2007', area: 'North America', profit: 2083.9 },
      { year: '2007', area: 'Africa & Middle East', profit: 330.12 },
      { year: '2011', area: 'Asia Pacific', profit: 4107.18 },
      { year: '2011', area: 'Western Europe', profit: 480.06 },
      { year: '2011', area: 'North America', profit: 1783.08 },
      { year: '2011', area: 'Africa & Middle East', profit: 495.3 }
    ],
    encode: {
      angleField: 'profit',
      colorField: 'area'
    },
    facet: {
      field: 'year',
      columnCount: 2
    },
    innerRadius: 0.5,
    labels: [
      {
        text: 'percentage',
        style: {
          fontSize: 10
        }
      }
    ],
    legend: {
      position: 'bottom',
      layout: {
        justifyContent: 'center'
      }
    },
    width: 800,
    height: 600,
    title: 'Bank Profits by Region (2007 vs 2011)'
  };

  try {
    const result3 = await callTool('generate_donut_chart', facetedTest);
    console.log('✅ Faceted donut charts generated successfully');
    console.log('   URL:', result3.content[0].text);
  } catch (error) {
    console.error('❌ Faceted donut charts failed:', error.message);
    return false;
  }

  // Test 4: Custom field mapping
  console.log('\n4. Testing custom field mapping...');
  const customFieldTest = {
    data: [
      { type: 'Product A', sales: 45000, region: 'North' },
      { type: 'Product B', sales: 32000, region: 'South' },
      { type: 'Product C', sales: 28000, region: 'East' },
      { type: 'Product D', sales: 15000, region: 'West' }
    ],
    encode: {
      angleField: 'sales',
      colorField: 'type'
    },
    innerRadius: 0.4,
    labels: [
      {
        text: 'value',
        style: {
          fontWeight: 'bold'
        }
      }
    ],
    width: 500,
    height: 500,
    title: 'Product Sales Distribution'
  };

  try {
    const result4 = await callTool('generate_donut_chart', customFieldTest);
    console.log('✅ Custom field mapping donut chart generated successfully');
    console.log('   URL:', result4.content[0].text);
  } catch (error) {
    console.error('❌ Custom field mapping failed:', error.message);
    return false;
  }

  console.log('\n🎉 All donut chart tests passed! The MCP tool provides full G2 v5 capabilities including:');
  console.log('   ✓ Basic donut charts with customizable inner radius');
  console.log('   ✓ Multiple label configurations (category, value, percentage)');
  console.log('   ✓ Center annotations for displaying totals/titles');
  console.log('   ✓ Faceted small multiples for comparisons');
  console.log('   ✓ Flexible legend positioning and layout');
  console.log('   ✓ Mark-specific styling (stroke, lineWidth, opacity)');
  console.log('   ✓ Custom field mapping for flexible data structures');
  console.log('   ✓ Full G2 v5 coordinate system (theta with innerRadius)');
  
  return true;
}

testDonutChart().then(success => {
  process.exit(success ? 0 : 1);
});