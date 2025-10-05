#!/usr/bin/env node

const { callTool } = require('../../build/utils/callTool.js');

async function testDonutHtml() {
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
    format: 'html'
  });
  
  // Check if it's a UI resource
  if (result.content[0].type === 'resource') {
    console.log('\nGenerated UI Resource:');
    console.log('URI:', result.content[0].resource.uri);
    console.log('MIME Type:', result.content[0].resource.mimeType);
    console.log('HTML Length:', result.content[0].resource.blob?.length || 0, 'bytes');
    
    // Save HTML to file
    const fs = require('fs');
    const html = result.content[0].resource.blob;
    const filename = '.cache/donut-chart-test.html';
    fs.mkdirSync('.cache', { recursive: true });
    fs.writeFileSync(filename, html);
    console.log('\nHTML saved to:', filename);
  } else {
    console.log('\nResult:', JSON.stringify(result, null, 2));
  }
  
  process.exit(0);
}

testDonutHtml().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
