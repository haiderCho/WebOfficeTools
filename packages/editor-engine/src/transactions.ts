import type { Block, Mark } from "@opensuite/core"
import type { Position } from "./state"

// =============================================================================
// Transaction types — every change flows through transactions, never direct mutation
// =============================================================================

export type Transaction =
  | InsertTextTransaction
  | DeleteTextTransaction
  | ToggleMarkTransaction
  | InsertBlockTransaction
  | DeleteBlockTransaction
  | UpdateBlockTransaction
  | MoveBlockTransaction
  | SplitBlockTransaction
  | MergeBlocksTransaction
  | SetSelectionTransaction
  | UpdateDocumentMetaTransaction

export interface InsertTextTransaction {
  type: "insert_text"
  blockId: string
  offset: number
  text: string
}

export interface DeleteTextTransaction {
  type: "delete_text"
  blockId: string
  from: number
  to: number
}

export interface ToggleMarkTransaction {
  type: "toggle_mark"
  blockId: string
  mark: Mark
  from: number
  to: number
}

export interface InsertBlockTransaction {
  type: "insert_block"
  parentId?: string // undefined = root level
  index: number
  block: Block
}

export interface DeleteBlockTransaction {
  type: "delete_block"
  blockId: string
}

export interface UpdateBlockTransaction {
  type: "update_block"
  blockId: string
  props: Partial<Block["props"]>
}

export interface MoveBlockTransaction {
  type: "move_block"
  blockId: string
  toIndex: number
  toParentId?: string
}

export interface SplitBlockTransaction {
  type: "split_block"
  blockId: string
  at: number
}

export interface MergeBlocksTransaction {
  type: "merge_blocks"
  firstBlockId: string
  secondBlockId: string
}

export interface SetSelectionTransaction {
  type: "set_selection"
  blockId: string
  anchor: Position
  head: Position
}

export interface UpdateDocumentMetaTransaction {
  type: "update_document_meta"
  title?: string
  metadata?: Record<string, unknown>
}
