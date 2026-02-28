"use client"

import { useEffect } from "react"
import { registerAllPlugins } from "../lib/register-plugins"

/**
 * Client component that initializes the plugin registry.
 * Placed in the root layout to ensure plugins are registered
 * before any editor components are mounted.
 */
export function PluginInitializer() {
  useEffect(() => {
    registerAllPlugins()
  }, [])

  return null
}
