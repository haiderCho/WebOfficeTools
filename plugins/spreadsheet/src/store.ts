import { create } from "zustand"

export interface CellFormat {
  bold?: boolean
  italic?: boolean
  align?: "left" | "center" | "right"
  color?: string
  backgroundColor?: string
}

interface SpreadsheetState {
  selectedCell: { row: number; col: number } | null
  formulaValue: string
  activeCellFormat: CellFormat
  
  setSelectedCell: (cell: { row: number; col: number } | null) => void
  setFormulaValue: (value: string) => void
  setActiveCellFormat: (format: CellFormat) => void
}

export const useSpreadsheetStore = create<SpreadsheetState>((set) => ({
  selectedCell: null,
  formulaValue: "",
  activeCellFormat: {},
  
  setSelectedCell: (cell) => set({ selectedCell: cell }),
  setFormulaValue: (value) => set({ formulaValue: value }),
  setActiveCellFormat: (format) => set({ activeCellFormat: format }),
}))
