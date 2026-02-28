// Types
export type { Document, DocumentType, DocumentMetadata } from "./types/document"
export type {
  Block,
  BlockType,
  BlockProps,
  InlineContent,
  InlineAttrs,
  Mark,
} from "./types/block"
export type {
  HeadingProps,
  ImageProps,
  CodeProps,
  MathProps,
  CalloutProps,
  TableCellProps,
  ColumnLayoutProps,
  TaskItemProps,
  VideoProps,
  SpreadsheetProps,
  CellData,
  CellFormat,
  SheetMeta,
  SlideProps,
  ChartProps,
  TableGraphProps,
  TableGraphColumn,
  TableGraphCell,
} from "./types/block-props"

// Block Registry
export {
  blockRegistry,
  type BlockDefinition,
  type ValidationResult,
} from "./blockRegistry"

// Helpers
export {
  createBlock,
  createDocument,
  findBlock,
  flattenBlocks,
  countWords,
} from "./helpers"

// Local Store
export { localStore } from "./localStore"
