"use client"

import {
  createContext,
  useContext,
  type ReactNode,
} from "react"
import type { Document } from "@opensuite/core"
import { useEditorEngine, type UseEditorEngineReturn } from "./useEditorEngine"

// =============================================================================
// EditorEngineProvider — React context for the editor engine
// =============================================================================

const EditorEngineContext = createContext<UseEditorEngineReturn | null>(null)

interface EditorEngineProviderProps {
  document: Document
  children: ReactNode
}

export function EditorEngineProvider({
  document,
  children,
}: EditorEngineProviderProps) {
  const engine = useEditorEngine(document)

  return (
    <EditorEngineContext.Provider value={engine}>
      {children}
    </EditorEngineContext.Provider>
  )
}

/**
 * Access the editor engine from any child component.
 */
export function useEngine(): UseEditorEngineReturn {
  const ctx = useContext(EditorEngineContext)
  if (!ctx) {
    throw new Error("useEngine must be used within an EditorEngineProvider")
  }
  return ctx
}
