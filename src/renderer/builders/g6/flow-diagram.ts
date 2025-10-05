/**
 * Flow Diagram Builder (Alias for Dagre Layout)
 * Migrated from legacy G6 v4 to G6 v5
 */

import { DagreGraphBuilder } from './dagre';
import type { ChartSpec } from '../base';

/**
 * Flow Diagram - Uses dagre layout for flowcharts and process diagrams
 * Transforms legacy data format to G6 v5 format
 */
export class FlowDiagramBuilder extends DagreGraphBuilder {
  buildHtml(spec: ChartSpec): string {
    // Transform legacy format to G6 v5 format
    const transformedSpec = this.transformLegacyData(spec);
    return super.buildHtml(transformedSpec);
  }

  /**
   * Transform legacy data format:
   * From: { nodes: [{ name: "A" }], edges: [{ source: "A", target: "B", name: "label" }] }
   * To: { nodes: [{ id: "A", label: "A" }], edges: [{ source: "A", target: "B", label: "label" }] }
   */
  private transformLegacyData(spec: ChartSpec): ChartSpec {
    const data = spec.data || { nodes: [], edges: [] };

    // Transform nodes: name -> id + label
    const nodes = Array.isArray(data.nodes)
      ? data.nodes
          .filter((n: any) => n && n.name)
          .map((n: any) => ({
            id: String(n.name),
            label: String(n.name)
          }))
      : [];

    // Create ID set for validation
    const idSet = new Set(nodes.map((n: any) => n.id));

    // Transform edges: validate source/target exist, map name -> label
    const edges = Array.isArray(data.edges)
      ? data.edges
          .filter(
            (e: any) =>
              e && idSet.has(String(e.source)) && idSet.has(String(e.target))
          )
          .map((e: any) => ({
            source: String(e.source),
            target: String(e.target),
            label: e.name ? String(e.name) : undefined
          }))
      : [];

    return {
      ...spec,
      data: { nodes, edges },
      direction: 'LR' // Left to right (traditional flowchart direction)
    };
  }
}
