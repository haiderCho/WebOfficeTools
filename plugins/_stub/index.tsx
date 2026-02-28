import type { Plugin, EditorProps, ToolbarProps } from "@opensuite/plugin-api"
import { createDocument } from "@opensuite/core"
import type { Document } from "@opensuite/core"

// =============================================================================
// Stub Plugin — development placeholder for Phase 0 verification
// Delete after Phase 1 is implemented
// =============================================================================

function StubEditor({ document }: EditorProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-6xl">📝</div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
          Editor Plugin Loaded
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Document: <span className="font-mono">{document.title}</span>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          This is a stub plugin. The real Word editor will replace this in Phase
          1.
        </p>
      </div>
    </div>
  )
}

function StubToolbar(_props: ToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <span className="text-xs text-gray-400">
        Toolbar will load here (Phase 1)
      </span>
    </div>
  )
}

export const plugin: Plugin = {
  id: "stub",
  name: "Stub (Development)",
  icon: "FileQuestion",
  documentType: "word",
  version: "0.0.1",

  blocks: [],

  createDocument: (title: string) => createDocument("word", title),
  loadDocument: (raw: unknown) => raw as Document,
  saveDocument: (doc: Document) => doc,

  Editor: StubEditor,
  Toolbar: StubToolbar,

  commands: {},
  keymap: {},
  exporters: {},
  capabilities: {},
}
