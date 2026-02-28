export interface Block {
  id: string
  type: BlockType
  props: BlockProps
  content: InlineContent[]
  children: Block[]
}

export interface InlineContent {
  text: string
  marks?: Mark[]
  attrs?: InlineAttrs
}

export interface InlineAttrs {
  href?: string
  color?: string
  bgcolor?: string
  assetId?: string
  [key: string]: unknown
}

export type Mark =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "link"
  | "highlight"
  | "color"
  | "superscript"
  | "subscript"

export type BlockType =
  // Text
  | "paragraph"
  | "heading"
  | "blockquote"
  | "callout"
  // Lists
  | "list-item"
  | "ordered-list-item"
  | "task-item"
  // Structure
  | "table"
  | "table-row"
  | "table-cell"
  | "column-layout"
  | "column"
  | "divider"
  | "container"
  // Media
  | "image"
  | "video"
  // Code/Math
  | "code"
  | "math"
  // Tool-specific (registered by plugins)
  | "spreadsheet"
  | "slide"
  | "latex-source"
  | "chart"
  | "table-graph" // Phase 0.5: Flexible Table Builder
  // Allow plugin-defined custom types
  | (string & {})

// Generic props — specific props defined in block-props.ts
export type BlockProps = Record<string, unknown>
