"use client"

import { registerPlugin } from "@opensuite/plugin-api"

/**
 * Register all available plugins at runtime.
 * This avoids circular dependencies in the core packages.
 */
export function registerAllPlugins() {
  if (typeof window === "undefined") return

  registerPlugin("word", () => 
    import("@opensuite/plugin-word")
  )
  
  registerPlugin("table", () => 
    import("@opensuite/plugin-table-builder")
  )

  registerPlugin("spreadsheet", () => 
    import("@opensuite/plugin-spreadsheet/src/index")
  )

  registerPlugin("slides", () => 
    import("@opensuite/plugin-presentation/src/index")
  )

  registerPlugin("latex", () => 
    import("@opensuite/plugin-latex")
  )

  registerPlugin("markdown", () => 
    import("@opensuite/plugin-markdown")
  )

  registerPlugin("diagram", () => 
    import("@opensuite/plugin-diagram-studio")
  )

  // Fallbacks for Phase 2+ types
  const fallbacks = ["pdf"]
  fallbacks.forEach(type => {
    registerPlugin(type, () => import("../../../plugins/_stub/index"))
  })
  
  console.log("🚀 OpenSuite Plugins Registered")
}
