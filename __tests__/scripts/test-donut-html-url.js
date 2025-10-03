#!/usr/bin/env node

const { callTool } = require('../../build/utils/callTool.js');

async function testDonutHtmlUrl() {
  const result = await callTool('generate_donut_chart', {
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
    title: 'Game Sales by Genre',
    format: 'html-url'
  });
  
  console.log('Result:', JSON.stringify(result, null, 2));
}

testDonutHtmlUrl().catch(console.error);
