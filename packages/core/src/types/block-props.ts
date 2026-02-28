// =============================================================================
// Block-specific prop interfaces
// Each block type uses one of these for its `props` field
// =============================================================================

export interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6
}

export interface ImageProps {
  assetId: string
  url?: string
  alt?: string
  width?: number
  align?: "left" | "center" | "right"
  caption?: string
}

export interface CodeProps {
  language: string
  filename?: string
  showLineNumbers?: boolean
}

export interface MathProps {
  latex: string
  display: "inline" | "block"
}

export interface CalloutProps {
  variant: "info" | "warning" | "error" | "success"
  title?: string
}

export interface TableCellProps {
  colspan?: number
  rowspan?: number
  header?: boolean
  align?: "left" | "center" | "right"
  width?: number
}

export interface ColumnLayoutProps {
  columns: number
  ratios?: number[] // e.g. [1, 2] for 1:2 split
}

export interface TaskItemProps {
  checked: boolean
}

export interface VideoProps {
  url: string
  width?: number
  height?: number
  caption?: string
}

// =============================================================================
// Tool-specific block props (registered by plugins)
// =============================================================================

export interface SpreadsheetProps {
  cells: Record<string, CellData>
  sheets: SheetMeta[]
  activeSheet: string
  colWidths?: Record<string, number>
  rowHeights?: Record<number, number>
  frozenRows?: number
  frozenCols?: number
}

export interface CellData {
  value: string
  format?: CellFormat
}

export interface CellFormat {
  type?: "general" | "number" | "currency" | "percent" | "date" | "text"
  bold?: boolean
  italic?: boolean
  align?: "left" | "center" | "right"
  bgcolor?: string
  color?: string
}

export interface SheetMeta {
  id: string
  name: string
}

export interface SlideProps {
  layout: "title" | "title-content" | "two-column" | "blank" | "image-full"
  background?: string
  transition?: "none" | "fade" | "slide"
  notes?: string
}

export interface ChartProps {
  chartType: "bar" | "line" | "pie" | "scatter" | "area"
  dataRange?: string
  title?: string
  width?: number
  height?: number
}

export interface TableGraphProps {
  columns: TableGraphColumn[]
  cells: TableGraphCell[]
  metadata?: Record<string, unknown>
}

export interface TableGraphColumn {
  id: string
  width?: number
  header?: boolean
}

export interface TableGraphCell {
  id: string
  columnId: string
  content: string // Simplified content for Phase 0.5
  rowSpan?: number
  colSpan?: number
  style?: Record<string, string>
}
