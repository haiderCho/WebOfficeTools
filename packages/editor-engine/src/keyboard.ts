import type { CommandFn } from "./commands"

// =============================================================================
// Keyboard shortcut map
// Key format: "Mod-b" (Mod = Ctrl/Cmd), "Shift-Enter", "Escape"
// =============================================================================

export type KeyBinding = {
  key: string
  command: CommandFn | string // string = lookup in command registry
  description?: string
}

/**
 * Core keyboard shortcuts available in every editor.
 */
export const coreKeymap: KeyBinding[] = [
  // These will be wired to actual commands when TipTap is integrated (Phase 1)
  { key: "Mod-z", command: "undo", description: "Undo" },
  { key: "Mod-Shift-z", command: "redo", description: "Redo" },
  { key: "Mod-y", command: "redo", description: "Redo (alt)" },
  { key: "Mod-b", command: "toggleBold", description: "Bold" },
  { key: "Mod-i", command: "toggleItalic", description: "Italic" },
  { key: "Mod-u", command: "toggleUnderline", description: "Underline" },
  { key: "Mod-s", command: "save", description: "Save" },
  { key: "Mod-Shift-s", command: "saveAs", description: "Save As" },
]

/**
 * Build a combined keymap from core + plugin keymaps.
 */
export function buildKeymap(
  pluginKeymap: KeyBinding[] = []
): KeyBinding[] {
  // Plugin keymaps override core keymaps for the same key
  const combined = new Map<string, KeyBinding>()
  for (const binding of coreKeymap) {
    combined.set(binding.key, binding)
  }
  for (const binding of pluginKeymap) {
    combined.set(binding.key, binding)
  }
  return Array.from(combined.values())
}
