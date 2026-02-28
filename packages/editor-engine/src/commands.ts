import type { Document, Block } from "@opensuite/core"
import { createBlock } from "@opensuite/core"
import type { Transaction } from "./transactions"

// =============================================================================
// Commands — pure functions that produce transactions
// =============================================================================

export type CommandFn = (
  doc: Document,
  dispatch: (...txs: Transaction[]) => void
) => boolean

/**
 * Insert a new paragraph block at the given index.
 */
export function insertParagraph(index: number): CommandFn {
  return (_doc, dispatch) => {
    const block = createBlock("paragraph", {
      content: [{ text: "" }],
    })
    dispatch({
      type: "insert_block",
      index,
      block,
    })
    return true
  }
}

/**
 * Insert a new block of any type at the given index.
 */
export function insertBlock(
  type: string,
  index: number,
  props: Partial<Block> = {}
): CommandFn {
  return (_doc, dispatch) => {
    const block = createBlock(type, props)
    dispatch({
      type: "insert_block",
      index,
      block,
    })
    return true
  }
}

/**
 * Delete a block by ID.
 */
export function deleteBlock(blockId: string): CommandFn {
  return (_doc, dispatch) => {
    dispatch({ type: "delete_block", blockId })
    return true
  }
}

/**
 * Update a block's props.
 */
export function updateBlock(
  blockId: string,
  props: Record<string, unknown>
): CommandFn {
  return (_doc, dispatch) => {
    dispatch({ type: "update_block", blockId, props })
    return true
  }
}

/**
 * Update document title.
 */
export function updateTitle(title: string): CommandFn {
  return (_doc, dispatch) => {
    dispatch({ type: "update_document_meta", title })
    return true
  }
}

// =============================================================================
// Core command registry
// =============================================================================

export const coreCommands = {
  insertParagraph,
  insertBlock,
  deleteBlock,
  updateBlock,
  updateTitle,
}
