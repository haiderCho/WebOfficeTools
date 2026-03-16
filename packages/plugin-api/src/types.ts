import type { ComponentType } from "react"
import type { Block, BlockDefinition, Document, DocumentType } from "@opensuite/core"

// =============================================================================
// Export types
// =============================================================================

export type ExportFormat =
  | "docx"
  | "pdf"
  | "html"
  | "markdown"
  | "xlsx"
  | "csv"
  | "pptx"
  | "tex"
  | "png"
  | "json"

export interface Exporter {
  format: ExportFormat
  label: string
  /** Client-side export — returns a Blob */
  exportClient?: (doc: Document) => Promise<Blob>
  /** Server-side export — sends doc to API and returns download URL */
  exportServer?: (doc: Document) => Promise<string>
}

// =============================================================================
// Editor / Toolbar component props
// =============================================================================

export interface EditorProps {
  document: Document
  onChange: (doc: Document) => void
  onStatsUpdate?: (stats: { words: number; chars: number }) => void
  theme?: "light" | "dark" | "system"
}


export interface ToolbarProps {
  document: Document
  onChange: (doc: Document) => void
  theme?: "light" | "dark" | "system"
}

// =============================================================================
// Command type (pure function)
// =============================================================================

export type Command = (
  doc: Document,
  dispatch: (updatedDoc: Document) => void
) => boolean

// =============================================================================
// Plugin interface — the contract every tool plugin must implement
// =============================================================================

export interface Plugin {
  id: string
  name: string
  icon: string
  documentType: DocumentType
  version: string

  /** Block types this plugin contributes to the registry */
  blocks: BlockDefinition[]

  /** Create a blank document of this type */
  createDocument: (title: string) => Document

  /** Parse raw JSON into a typed Document */
  loadDocument: (raw: unknown) => Document

  /** Serialize a Document for persistence */
  saveDocument: (doc: Document) => unknown

  /** The main editor React component */
  Editor: ComponentType<EditorProps>

  /** The toolbar React component */
  Toolbar: ComponentType<ToolbarProps>

  /** Commands this plugin exposes (for keyboard shortcuts, menus) */
  commands: Record<string, Command>

  /** Export formats supported by this plugin */
  exporters: Record<string, Exporter>

  /** Keyboard shortcut bindings */
  keymap: Record<string, Command>

  /** Optional capability flags */
  capabilities: {
    collaboration?: boolean
    versioning?: boolean
    comments?: boolean
    export?: ExportFormat[]
  }
}
