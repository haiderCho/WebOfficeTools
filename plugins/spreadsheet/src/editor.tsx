import { useRef, useEffect, useState } from "react"
import type { EditorProps } from "@opensuite/plugin-api"
import { createBlock } from "@opensuite/core"
import "handsontable/styles/handsontable.min.css"
import "handsontable/styles/ht-theme-main.min.css"
import { cellsToGrid, toCellKey } from "./utils"
import { useSpreadsheetStore } from "./store"
import SheetTabs from "./components/SheetTabs"
import "./styles/spreadsheet.css"

export default function SpreadsheetEditor({ document, onChange }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hotRef = useRef<any>(null)
  const { setSelectedCell, setFormulaValue, setActiveCellFormat, selectedCell, formulaValue } = useSpreadsheetStore()
  
  // Explicitly ensure the container has height
  const [containerHeight, setContainerHeight] = useState("600px")
  
  // Find or create the spreadsheet block
  const spreadsheetBlock = document.blocks.find(b => b.type === "spreadsheet") || 
    createBlock("spreadsheet", { 
      props: { 
        cells: {}, 
        sheets: [{ id: "sheet1", name: "Sheet1" }], 
        activeSheet: "sheet1" 
      } 
    })

  const { cells = {}, sheets = [], activeSheet = "sheet1" } = spreadsheetBlock.props as any

  const updateDocument = (newProps: any) => {
    const updatedBlocks = document.blocks.some(b => b.id === spreadsheetBlock.id)
      ? document.blocks.map(b => b.id === spreadsheetBlock.id ? { ...b, props: { ...b.props, ...newProps } } : b)
      : [...document.blocks, { ...spreadsheetBlock, props: { ...spreadsheetBlock.props, ...newProps } }]
    
    onChange({ ...document, blocks: updatedBlocks })
  }

  const handleAddSheet = () => {
    const newId = `sheet${sheets.length + 1}`
    const newSheet = { id: newId, name: `Sheet${sheets.length + 1}` }
    updateDocument({ 
      sheets: [...sheets, newSheet],
      activeSheet: newId
    })
  }

  const handleSwitchSheet = (id: string) => {
    updateDocument({ activeSheet: id })
  }

  const handleDeleteSheet = (id: string) => {
    if (sheets.length <= 1) return
    const newSheets = sheets.filter((s: any) => s.id !== id)
    updateDocument({ 
      sheets: newSheets,
      activeSheet: activeSheet === id ? newSheets[0].id : activeSheet
    })
  }

  useEffect(() => {
    if (!containerRef.current || hotRef.current) return

    const initHot = async () => {
      const Handsontable = (await import("handsontable")).default
      const { HyperFormula } = await import("hyperformula")
      
      const hf = HyperFormula.buildEmpty({
        licenseKey: "internal-use-in-handsontable",
      })

      const hot = new Handsontable(containerRef.current!, {
        data: cellsToGrid(cells),
        rowHeaders: true,
        colHeaders: true,
        height: "100%",
        width: "100%",
        stretchH: "all",
        licenseKey: "non-commercial-and-evaluation",
        contextMenu: true,
        filters: true,
        dropdownMenu: true,
        columnSorting: true,
        manualColumnFreeze: true,
        formulas: {
          engine: hf,
        },
        cells: (row, col) => {
          const cellProps: any = {}
          const key = toCellKey(row, col)
          const cellData = (spreadsheetBlock.props as any).cells[key]
          
          if (cellData?.format) {
            let className = ""
            if (cellData.format.bold) className += " font-bold"
            if (cellData.format.italic) className += " italic"
            if (cellData.format.align) className += ` ht${cellData.format.align.charAt(0).toUpperCase() + cellData.format.align.slice(1)}`
            cellProps.className = className.trim()
          }
          
          return cellProps
        },
        afterSelection: (row, col) => {
          if (row < 0 || col < 0) return
          setSelectedCell({ row, col })
          const key = toCellKey(row, col)
          const cellData = (spreadsheetBlock.props as any).cells[key] || {}
          
          const value = hot.getSourceDataAtCell(row, col) ?? ""
          setFormulaValue(value.toString())
          setActiveCellFormat(cellData.format || {})
        },
        afterChange: (changes) => {
          if (!changes) return
          
          const newCells = { ...(spreadsheetBlock.props as any).cells }
          changes.forEach(([row, col, oldVal, newVal]) => {
            if (oldVal === newVal) return
            const key = toCellKey(row as number, col as number)
            
            // Sync with formula bar if it's the selected cell
            setFormulaValue((newVal ?? "") as string)

            if (!newVal) {
              delete newCells[key]
            } else {
              newCells[key] = { value: newVal as string }
            }
          })

          // Update the document
          const updatedBlocks = document.blocks.some(b => b.id === spreadsheetBlock.id)
            ? document.blocks.map(b => b.id === spreadsheetBlock.id ? { ...b, props: { ...b.props, cells: newCells } } : b)
            : [...document.blocks, { ...spreadsheetBlock, props: { ...spreadsheetBlock.props, cells: newCells } }]

          onChange({
            ...document,
            blocks: updatedBlocks
          })
        }
      })

      hotRef.current = hot
    }

    initHot()

    return () => {
      if (hotRef.current) {
        hotRef.current.destroy()
        hotRef.current = null
      }
    }
  }, []) // Initial mount

  useEffect(() => {
    if (hotRef.current && selectedCell && selectedCell.row >= 0 && selectedCell.col >= 0) {
      const currentValue = hotRef.current.getSourceDataAtCell(selectedCell.row, selectedCell.col)
      if (currentValue !== formulaValue) {
        hotRef.current.setDataAtCell(selectedCell.row, selectedCell.col, formulaValue)
      }
    }
  }, [formulaValue, selectedCell])

  return (
    <div className="flex-1 overflow-hidden bg-white dark:bg-gray-950 p-4 flex flex-col gap-0 h-full w-full">
      <div 
        ref={containerRef} 
        style={{ height: containerHeight }}
        className="spreadsheet-container w-full shadow-2xl rounded-t-lg overflow-hidden border border-gray-200 dark:border-gray-800" 
      />
      <SheetTabs 
        sheets={sheets}
        activeSheet={activeSheet}
        onAdd={handleAddSheet}
        onSwitch={handleSwitchSheet}
        onDelete={handleDeleteSheet}
      />
    </div>
  )
}
