/**
 * Arc Diagram Builder for G2 v5
 *
 * Uses G2's line + point marks with custom data transforms
 * to create arc diagrams with linear or circular layouts
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class ArcDiagramBuilder extends ChartBuilder {
  buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? { nodes: [], edges: [] };
    const layout = spec.layout || 'linear';
    const width = spec.width || 600;
    const height = spec.height || 400;
    const theme = (spec.theme as any) || 'classic';

    const stepsLinear = Number((spec as any).stepsLinear ?? 15);
    const stepsCircular = Number((spec as any).stepsCircular ?? 20);
    const padding = Number((spec as any).padding ?? 50);

    // Build color scale preference: prefer spec.scale.color.range, fallback to style.palette (array only)
    const preferredColorRange = (spec as any)?.scale?.color?.range || (Array.isArray(spec.style?.palette) ? spec.style?.palette : null);

    const isFetch = typeof (data as any)?.type === 'string' && (data as any)?.type === 'fetch' && (data as any)?.value;

    const dataConfig = isFetch
      ? `{
      type: 'fetch',
      value: ${JSON.stringify((data as any).value)},
      transform: [TRANSFORM_BLOCK]
    }`
      : `{
      value: ${JSON.stringify(data)},
      transform: [TRANSFORM_BLOCK]
    }`;

    const transformBlock = `{
      type: 'custom',
      callback: (data) => {
        const nodes = data?.nodes || [];
        const links = data?.links || data?.edges || [];

        if ('${layout}' === 'circular') {
          // Circular layout
          const centerX = ${width} / 2;
          const centerY = ${height} / 2;
          const radius = Math.min(${width}, ${height}) / 2 - 80;
          const nodeCount = nodes.length || 1;

          // Position nodes in circle
          const nodePositions = nodes.map((node, i) => {
            const angle = (i / nodeCount) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return {
              ...node,
              x,
              y,
              type: 'node'
            };
          });

          // Create arc data using quadratic bezier curves through center
          const arcData = [];
          links.forEach((edge) => {
            const sourceNode = nodePositions.find((n) => String(n.id) === String(edge.source));
            const targetNode = nodePositions.find((n) => String(n.id) === String(edge.target));

            if (sourceNode && targetNode) {
              const steps = ${stepsCircular};
              const value = Number(edge.value ?? 1);
              for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                // Quadratic bezier with center as control point
                const x = Math.pow(1 - t, 2) * sourceNode.x + 2 * (1 - t) * t * centerX + Math.pow(t, 2) * targetNode.x;
                const y = Math.pow(1 - t, 2) * sourceNode.y + 2 * (1 - t) * t * centerY + Math.pow(t, 2) * targetNode.y;

                arcData.push({
                  x,
                  y,
                  value,
                  linkId: String(edge.source) + '-' + String(edge.target),
                  sourceName: sourceNode.label || sourceNode.name || sourceNode.id,
                  targetName: targetNode.label || targetNode.name || targetNode.id,
                  type: 'link'
                });
              }
            }
          });

          return [...arcData, ...nodePositions];
        } else {
          // Linear layout
          const nodeData = [];
          const arcData = [];
          const W = ${width};
          const H = ${height};
          const pad = ${padding};
          const nodeY = H - 100;

          // Position nodes linearly
          nodes.forEach((node, i) => {
            const x = nodes.length > 1 ? pad + (i / (nodes.length - 1)) * (W - 2 * pad) : W / 2;
            nodeData.push({
              ...node,
              x,
              y: nodeY,
              type: 'node'
            });
          });

          // Create arcs as sinusoidal curves
          links.forEach((edge) => {
            const sourceNode = nodeData.find((n) => String(n.id) === String(edge.source));
            const targetNode = nodeData.find((n) => String(n.id) === String(edge.target));

            if (sourceNode && targetNode) {
              const distance = Math.abs(targetNode.x - sourceNode.x);
              const arcHeight = Math.min(150, distance * 0.3);
              const steps = ${stepsLinear};
              const value = Number(edge.value ?? 1);

              for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const x = sourceNode.x + (targetNode.x - sourceNode.x) * t;
                const y = nodeY - arcHeight * Math.sin(Math.PI * t);

                arcData.push({
                  x,
                  y,
                  value,
                  linkId: String(edge.source) + '-' + String(edge.target),
                  sourceName: sourceNode.label || sourceNode.name || sourceNode.id,
                  targetName: targetNode.label || targetNode.name || targetNode.id,
                  type: 'link'
                });
              }
            }
          });

          return [...arcData, ...nodeData];
        }
      }
    }`;

    const chartScript = `
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${width},
    height: ${height},
    theme: ${JSON.stringify(theme)},
  });

  chart.options({
    type: 'view',
    data: ${dataConfig.replace('TRANSFORM_BLOCK', transformBlock)}
  });

  // Draw arcs/edges
  const line = chart
    .line()
    .data({ transform: [{ type: 'filter', callback: (d) => d.type === 'link' }] })
    .encode('x', 'x')
    .encode('y', 'y')
    .encode('series', 'linkId')
    .encode('size', 'value')
    .encode('tooltip', ['sourceName', 'targetName', 'value'])
    .style('stroke', '#A3B1BF')
    .style('strokeOpacity', 0.4)
    .style('lineCap', 'round')
    .scale('size', { range: [0.8, 3] });

  // Draw nodes
  const point = chart
    .point()
    .data({ transform: [{ type: 'filter', callback: (d) => d.type === 'node' }] })
    .encode('x', 'x')
    .encode('y', 'y')
    .encode('color', 'group')
    .style('r', 6)
    .style('stroke', '#fff')
    .style('strokeWidth', 2)
    .style('fillOpacity', 0.9);

  ${preferredColorRange ? `point.scale('color', { range: ${JSON.stringify(preferredColorRange)} });` : ''}

  // Draw node labels
  chart
    .text()
    .data({ transform: [{ type: 'filter', callback: (d) => d.type === 'node' }] })
    .encode('x', 'x')
    .encode('y', 'y')
    .encode('text', (d) => d.label || d.id)
    .style('textAlign', 'center')
    .style('textBaseline', 'middle')
    .style('fontSize', 11)
    .style('fill', '#333')
    .style('fontWeight', 'normal')
    .style('dy', '${layout}' === 'circular' ? -15 : 15);

  chart.render();
`;

    return this.buildContainer(spec, chartScript);
  }
}
