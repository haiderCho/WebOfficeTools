import type { Block } from "./types/block"

export interface BlockDefinition {
  type: string
  defaultProps: Record<string, unknown>
  validate?: (block: Block) => ValidationResult
  toHTML?: (block: Block) => string
  toMarkdown?: (block: Block) => string
}

export interface ValidationResult {
  valid: boolean
  errors?: string[]
}

class BlockRegistry {
  private registry = new Map<string, BlockDefinition>()

  register(def: BlockDefinition): void {
    this.registry.set(def.type, def)
  }

  get(type: string): BlockDefinition | undefined {
    return this.registry.get(type)
  }

  isRegistered(type: string): boolean {
    return this.registry.has(type)
  }

  getAll(): BlockDefinition[] {
    return Array.from(this.registry.values())
  }

  unregister(type: string): boolean {
    return this.registry.delete(type)
  }
}

// Core blocks — always available regardless of which plugin is active
const coreBlocks: BlockDefinition[] = [
  { type: "paragraph", defaultProps: {} },
  { type: "heading", defaultProps: { level: 1 } },
  { type: "blockquote", defaultProps: {} },
  { type: "callout", defaultProps: { variant: "info" } },
  { type: "list-item", defaultProps: {} },
  { type: "ordered-list-item", defaultProps: {} },
  { type: "task-item", defaultProps: { checked: false } },
  { type: "table", defaultProps: {} },
  { type: "table-row", defaultProps: {} },
  { type: "table-cell", defaultProps: {} },
  { type: "column-layout", defaultProps: { columns: 2 } },
  { type: "column", defaultProps: {} },
  { type: "divider", defaultProps: {} },
  { type: "container", defaultProps: {} },
  { type: "image", defaultProps: { align: "center" } },
  { type: "video", defaultProps: {} },
  { type: "code", defaultProps: { language: "plaintext" } },
  { type: "math", defaultProps: { display: "block" } },
  { type: "table-graph", defaultProps: { columns: [], cells: [] } },
]

export const blockRegistry = new BlockRegistry()

// Auto-register core blocks
coreBlocks.forEach((b) => blockRegistry.register(b))
