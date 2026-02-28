import { useCallback, useRef, useState } from "react"
import type { Document } from "@opensuite/core"
import type { EditorState } from "./state"
import { createEditorState } from "./state"
import type { Transaction } from "./transactions"
import { applyTransaction, applyBatch } from "./reducer"
import { HistoryManager } from "./history"

// =============================================================================
// useEditorEngine — the main React hook for managing editor state
// =============================================================================

export interface UseEditorEngineReturn {
  state: EditorState
  dispatch: (...transactions: Transaction[]) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  resetDocument: (doc: Document) => void
  markSaved: () => void
}

export function useEditorEngine(
  initialDocument: Document
): UseEditorEngineReturn {
  const [state, setState] = useState<EditorState>(() =>
    createEditorState(initialDocument)
  )
  const historyRef = useRef(new HistoryManager())

  const dispatch = useCallback((...transactions: Transaction[]) => {
    setState((prev) => {
      const next = applyBatch(prev, transactions)
      // Push to history (exclude selection-only changes)
      const meaningful = transactions.filter(
        (t) => t.type !== "set_selection"
      )
      if (meaningful.length > 0) {
        historyRef.current.push(meaningful)
      }
      return next
    })
  }, [])

  const undo = useCallback(() => {
    const batch = historyRef.current.undo()
    if (!batch) return
    // For now, undo is a simplified no-op placeholder
    // Full undo requires inverse transactions, which will be implemented with TipTap
  }, [])

  const redo = useCallback(() => {
    const batch = historyRef.current.redo()
    if (!batch) return
    // Same as undo — placeholder for Phase 0
  }, [])

  const resetDocument = useCallback((doc: Document) => {
    setState(createEditorState(doc))
    historyRef.current.clear()
  }, [])

  const markSaved = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDirty: false,
      isSaving: false,
      lastSavedAt: new Date().toISOString(),
    }))
  }, [])

  return {
    state,
    dispatch,
    undo,
    redo,
    canUndo: historyRef.current.canUndo(),
    canRedo: historyRef.current.canRedo(),
    resetDocument,
    markSaved,
  }
}
