import { produce } from "immer"
import { findBlock } from "@opensuite/core"
import type { EditorState } from "./state"
import type { Transaction } from "./transactions"

// =============================================================================
// Reducer — applies transactions to produce new state (immutable via immer)
// =============================================================================

export function applyTransaction(
  state: EditorState,
  tx: Transaction
): EditorState {
  return produce(state, (draft) => {
    switch (tx.type) {
      case "insert_text": {
        const block = findBlockInDraft(draft, tx.blockId)
        if (!block) break
        // If no content exists, create one
        if (block.content.length === 0) {
          block.content.push({ text: "" })
        }
        const content = block.content[0]
        if (content) {
          content.text =
            content.text.slice(0, tx.offset) +
            tx.text +
            content.text.slice(tx.offset)
        }
        draft.isDirty = true
        break
      }

      case "delete_text": {
        const block = findBlockInDraft(draft, tx.blockId)
        if (!block || block.content.length === 0) break
        const content = block.content[0]
        if (content) {
          content.text =
            content.text.slice(0, tx.from) + content.text.slice(tx.to)
        }
        draft.isDirty = true
        break
      }

      case "toggle_mark": {
        // Mark toggling — simplified for Phase 0
        // Full implementation will handle inline content ranges
        draft.isDirty = true
        break
      }

      case "insert_block": {
        if (tx.parentId) {
          const parent = findBlockInDraft(draft, tx.parentId)
          if (parent) {
            parent.children.splice(tx.index, 0, tx.block)
          }
        } else {
          draft.document.blocks.splice(tx.index, 0, tx.block)
        }
        draft.isDirty = true
        break
      }

      case "delete_block": {
        deleteBlockRecursive(draft.document.blocks, tx.blockId)
        draft.isDirty = true
        break
      }

      case "update_block": {
        const block = findBlockInDraft(draft, tx.blockId)
        if (block) {
          Object.assign(block.props, tx.props)
        }
        draft.isDirty = true
        break
      }

      case "move_block": {
        // Remove from current position
        const removed = removeBlockRecursive(draft.document.blocks, tx.blockId)
        if (!removed) break
        // Insert at new position
        if (tx.toParentId) {
          const parent = findBlockInDraft(draft, tx.toParentId)
          if (parent) {
            parent.children.splice(tx.toIndex, 0, removed)
          }
        } else {
          draft.document.blocks.splice(tx.toIndex, 0, removed)
        }
        draft.isDirty = true
        break
      }

      case "split_block": {
        // Split a block at a given offset in its first content node
        const block = findBlockInDraft(draft, tx.blockId)
        if (!block || block.content.length === 0) break
        // Simplified: only handles single-content splits
        draft.isDirty = true
        break
      }

      case "merge_blocks": {
        // Merge two adjacent blocks' content
        const first = findBlockInDraft(draft, tx.firstBlockId)
        const second = findBlockInDraft(draft, tx.secondBlockId)
        if (first && second) {
          first.content.push(...second.content)
          deleteBlockRecursive(draft.document.blocks, tx.secondBlockId)
        }
        draft.isDirty = true
        break
      }

      case "set_selection": {
        draft.selection = {
          blockId: tx.blockId,
          anchor: tx.anchor,
          head: tx.head,
        }
        break
      }

      case "update_document_meta": {
        if (tx.title !== undefined) {
          draft.document.title = tx.title
        }
        if (tx.metadata) {
          Object.assign(draft.document.metadata, tx.metadata)
        }
        draft.document.updatedAt = new Date().toISOString()
        draft.isDirty = true
        break
      }
    }
  })
}

/**
 * Apply multiple transactions in sequence.
 */
export function applyBatch(
  state: EditorState,
  transactions: Transaction[]
): EditorState {
  return transactions.reduce(
    (s, tx) => applyTransaction(s, tx),
    state
  )
}

// =============================================================================
// Internal helpers (work within immer draft)
// =============================================================================

function findBlockInDraft(
  draft: EditorState,
  id: string
): ReturnType<typeof findBlock> {
  return findBlock(draft.document, id)
}

function deleteBlockRecursive(blocks: { id: string; children: any[] }[], id: string): boolean {
  const idx = blocks.findIndex((b) => b.id === id)
  if (idx !== -1) {
    blocks.splice(idx, 1)
    return true
  }
  for (const block of blocks) {
    if (deleteBlockRecursive(block.children, id)) return true
  }
  return false
}

function removeBlockRecursive(
  blocks: { id: string; children: any[] }[],
  id: string
): any | null {
  const idx = blocks.findIndex((b) => b.id === id)
  if (idx !== -1) {
    return blocks.splice(idx, 1)[0]
  }
  for (const block of blocks) {
    const removed = removeBlockRecursive(block.children, id)
    if (removed) return removed
  }
  return null
}
