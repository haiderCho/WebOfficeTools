import { nanoid } from "nanoid"
import type { Block, BlockType } from "./types/block"
import type { Document, DocumentType } from "./types/document"

/**
 * Create a new block with a unique ID and sensible defaults.
 */
export function createBlock(
  type: BlockType,
  partial: Partial<Omit<Block, "id">> = {}
): Block {
  return {
    id: nanoid(10),
    type,
    props: {},
    content: [],
    children: [],
    ...partial,
  }
}

/**
 * Create a new document container with a unique ID.
 */
export function createDocument(type: DocumentType, title: string): Document {
  const now = new Date().toISOString()
  return {
    id: nanoid(16),
    type,
    title,
    metadata: {},
    blocks: [],
    version: 1,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Recursively search the block tree for a block by ID.
 */
export function findBlock(doc: Document, id: string): Block | undefined {
  function search(blocks: Block[]): Block | undefined {
    for (const b of blocks) {
      if (b.id === id) return b
      const found = search(b.children)
      if (found) return found
    }
    return undefined
  }
  return search(doc.blocks)
}

/**
 * Flatten a nested block tree into a single-level array.
 * Useful for counts, searches, and serialization.
 */
export function flattenBlocks(blocks: Block[]): Block[] {
  return blocks.flatMap((b) => [b, ...flattenBlocks(b.children)])
}

/**
 * Count all text characters in a document (for word count / status bar).
 */
export function countWords(doc: Document): number {
  const allBlocks = flattenBlocks(doc.blocks)
  const text = allBlocks
    .flatMap((b) => b.content.map((c) => c.text))
    .join(" ")
  return text.split(/\s+/).filter(Boolean).length
}
