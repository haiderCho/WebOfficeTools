"use client"

import { registerPlugin } from "@opensuite/plugin-api"

/**
 * Register all available plugins at runtime.
 * This avoids circular dependencies in the core packages.
 */
export function registerAllPlugins() {
  if (typeof window === "undefined") return

  registerPlugin("word", () => 
    import("../../../plugins/word/src/index")
  )
  
  registerPlugin("table", () => 
    import("../../../plugins/table-builder/index")
  )

  // Fallbacks for Phase 2+ types
  const fallbacks = ["spreadsheet", "slides", "latex", "markdown", "pdf"]
  fallbacks.forEach(type => {
    registerPlugin(type, () => import("../../../plugins/_stub/index"))
  })
  
  console.log("🚀 OpenSuite Plugins Registered")
}
