// State
export { createEditorState, type EditorState, type Selection, type Position } from "./state"

// Transactions
export type {
  Transaction,
  InsertTextTransaction,
  DeleteTextTransaction,
  ToggleMarkTransaction,
  InsertBlockTransaction,
  DeleteBlockTransaction,
  UpdateBlockTransaction,
  MoveBlockTransaction,
  SplitBlockTransaction,
  MergeBlocksTransaction,
  SetSelectionTransaction,
  UpdateDocumentMetaTransaction,
} from "./transactions"

// Reducer
export { applyTransaction, applyBatch } from "./reducer"

// Commands
export { coreCommands, type CommandFn } from "./commands"

// History
export { HistoryManager } from "./history"

// Keyboard
export { coreKeymap, buildKeymap, type KeyBinding } from "./keyboard"

// Autosave
export { createAutosave, type AutosaveOptions, type AutosaveHandle } from "./autosave"

// React hooks & providers
export { useEditorEngine, type UseEditorEngineReturn } from "./useEditorEngine"
export { EditorEngineProvider, useEngine } from "./EditorEngineProvider"
