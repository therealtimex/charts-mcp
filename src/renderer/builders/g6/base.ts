import { ChartBuilder } from "../base";
import type { ChartSpec } from "../base";

/**
 * Base G6 Graph Builder
 *
 * Abstract base class for all G6 v5 graph visualizations.
 * Provides common functionality for node-edge graphs.
 */
export abstract class G6GraphBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g6@5/dist/g6.min.js"></script>';
  }

  /**
   * Build common G6 configuration
   */
  protected buildG6Config(spec: ChartSpec): any {
    return {
      container: 'container',
      width: spec.width ?? 800,
      height: spec.height ?? 600,
      theme: spec.theme ?? 'light',
      autoFit: 'view',
      padding: 20
    };
  }

  /**
   * Helper to escape special characters in graph data
   */
  protected escapeGraphData(data: any): string {
    return JSON.stringify(data);
  }
}
