export interface Document {
  id: string
  type: DocumentType
  title: string
  metadata: DocumentMetadata
  blocks: Block[]
  version: number
  createdAt: string // ISO 8601
  updatedAt: string
}

export interface DocumentMetadata {
  author?: string
  tags?: string[]
  theme?: string
  pageSize?: "A4" | "Letter" | "custom"
  customPageWidth?: number
  customPageHeight?: number
  [key: string]: unknown
}

export type DocumentType =
  | "word"
  | "spreadsheet"
  | "slides"
  | "latex"
  | "markdown"
  | "pdf"
  | "table"
  | "diagram"
  | "slides"

// Re-export Block so Document can reference it
import type { Block } from "./block"
export type { Block as DocumentBlock }
