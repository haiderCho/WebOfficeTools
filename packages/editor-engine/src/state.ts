import type { Document } from "@opensuite/core"

// =============================================================================
// Editor State — the complete state of the editor at any point in time
// =============================================================================

export interface EditorState {
  document: Document
  selection: Selection | null
  isDirty: boolean
  isSaving: boolean
  lastSavedAt: string | null
}

export interface Selection {
  blockId: string
  anchor: Position
  head: Position
}

export interface Position {
  blockId: string
  offset: number
}

/**
 * Create initial editor state from a document.
 */
export function createEditorState(doc: Document): EditorState {
  return {
    document: doc,
    selection: null,
    isDirty: false,
    isSaving: false,
    lastSavedAt: null,
  }
}
