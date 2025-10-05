/**
 * Chart Dispatcher
 * Routes chart generation requests to appropriate builders
 */

import { ChartRegistry } from './registry';
import type { ChartSpec } from './builders/base';

export interface ChartResult {
  html: string;
  type: string;
  renderer: 'g2' | 'g6' | 'hybrid' | 'custom';
}

export class ChartDispatcher {
  /**
   * Dispatch chart generation to appropriate builder
   */
  static async dispatch(type: string, spec: ChartSpec): Promise<ChartResult> {
    // Get chart definition from registry
    const definition = ChartRegistry.get(type);

    if (!definition) {
      throw new Error(`Chart type "${type}" is not registered. Available types: ${ChartRegistry.getTypes().join(', ')}`);
    }

    // Validate spec against schema
    try {
      definition.schema.parse(spec);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Invalid chart specification for type "${type}": ${error.message}`);
      }
      throw error;
    }

    // Build HTML using the registered builder
    try {
      const html = definition.builder.buildHtml(spec);

      return {
        html,
        type: definition.type,
        renderer: definition.renderer
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to build chart "${type}": ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Check if a chart type is supported
   */
  static isSupported(type: string): boolean {
    return ChartRegistry.has(type);
  }

  /**
   * Get all supported chart types
   */
  static getSupportedTypes(): string[] {
    return ChartRegistry.getTypes();
  }

  /**
   * Get chart types by renderer
   */
  static getTypesByRenderer(renderer: 'g2' | 'g6' | 'hybrid' | 'custom'): string[] {
    return ChartRegistry.getByRenderer(renderer).map(def => def.type);
  }

  /**
   * Get chart types by category
   */
  static getTypesByCategory(category: 'statistical' | 'graph' | 'map' | 'hybrid' | 'custom'): string[] {
    return ChartRegistry.getByCategory(category).map(def => def.type);
  }
}
