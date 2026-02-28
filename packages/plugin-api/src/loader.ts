import type { DocumentType } from "@opensuite/core"
import type { Plugin } from "./types"

// =============================================================================
// Plugin Loader — lazy loads plugins from the plugin directory
// =============================================================================

const registry = new Map<string, Plugin>()

/**
 * Plugin import map — maps document types to their plugin module paths.
 * Populated by the app shell at runtime to avoid circular dependencies.
 */
const pluginImportMap: Record<string, () => Promise<{ plugin: Plugin }>> = {}

/**
 * Load a plugin by document type. Caches after first load.
 */
export async function loadPlugin(type: DocumentType): Promise<Plugin> {
  // Return cached if already loaded
  const cached = registry.get(type)
  if (cached) return cached

  const importer = pluginImportMap[type]
  if (!importer) {
    throw new Error(`No plugin registered for document type: "${type}"`)
  }

  const mod = await importer()
  registry.set(type, mod.plugin)
  return mod.plugin
}

/**
 * Check if a plugin type is available.
 */
export function isPluginAvailable(type: string): boolean {
  return type in pluginImportMap
}

/**
 * Get all available plugin types.
 */
export function getAvailablePlugins(): string[] {
  return Object.keys(pluginImportMap)
}

/**
 * Register a plugin at runtime (for dynamic/third-party plugins).
 */
export function registerPlugin(
  type: string,
  importer: () => Promise<{ plugin: Plugin }>
): void {
  pluginImportMap[type] = importer
}
