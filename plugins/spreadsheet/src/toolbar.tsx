import { Calculator, Table2, FileSpreadsheet, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Download, FileDown } from "lucide-react"
import { useSpreadsheetStore } from "./store"
import * as XLSX from "xlsx"
import { exportDocument } from "@opensuite/utils"
import "./styles/spreadsheet.css"

export default function SpreadsheetToolbar({ document, onChange }: any) {
  const { formulaValue, setFormulaValue, selectedCell, activeCellFormat } = useSpreadsheetStore()
  
  const spreadsheetBlock = document.blocks.find((b: any) => b.type === "spreadsheet")
  const { cells = {} } = spreadsheetBlock?.props || {}

  const updateFormat = (formatUpdate: any) => {
    if (!selectedCell || !spreadsheetBlock) return
    
    const key = `${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row + 1}`
    const currentCell = cells[key] || { value: "" }
    
    const newCells = {
      ...cells,
      [key]: {
        ...currentCell,
        format: {
          ...(currentCell.format || {}),
          ...formatUpdate
        }
      }
    }

    const updatedBlocks = document.blocks.map((b: any) => 
      b.id === spreadsheetBlock.id ? { ...b, props: { ...b.props, cells: newCells } } : b
    )

    onChange({ ...document, blocks: updatedBlocks })
  }

  const exportToXLSX = () => {
    if (!spreadsheetBlock) return
    
    const wb = XLSX.utils.book_new()
    const maxRow = Object.keys(cells).reduce((max, key) => Math.max(max, parseInt(key.match(/\d+/)?.[0] || "0")), 0)
    const maxCol = Object.keys(cells).reduce((max, key) => {
      const match = key.match(/[A-Z]+/)
      const label = match ? match[0] : "A"
      let col = 0
      for (let i = 0; i < label.length; i++) {
        col = col * 26 + (label.charCodeAt(i) - 64)
      }
      return Math.max(max, col)
    }, 0)

    const data: any[][] = Array.from({ length: Math.max(maxRow, 10) }, () => 
      Array(Math.max(maxCol, 10)).fill("")
    )

    Object.entries(cells).forEach(([key, cell]: [string, any]) => {
      const match = key.match(/^([A-Z]+)(\d+)$/)
      if (!match) return
      const [, label, rowStr] = match
      if (!label || !rowStr) return
      
      let col = 0
      for (let i = 0; i < label.length; i++) {
        col = col * 26 + (label.charCodeAt(i) - 64)
      }
      const row = parseInt(rowStr, 10) - 1
      if (data[row] && col > 0 && col <= data[row].length) {
        data[row][col - 1] = cell?.value || ""
      }
    })

    const ws = XLSX.utils.aoa_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
    XLSX.writeFile(wb, `${document.title || "spreadsheet"}.xlsx`)
  }

  const exportToPDF = async () => {
    if (!spreadsheetBlock) return
    let html = `<table border="1" style="border-collapse: collapse; width: 100%;">`
    const maxRow = Object.keys(cells).reduce((max, key) => Math.max(max, parseInt(key.match(/\d+/)?.[0] || "0")), 0)
    const maxCol = Object.keys(cells).reduce((max, key) => {
      const match = key.match(/[A-Z]+/)
      const label = match ? match[0] : "A"
      let col = 0
      for (let i = 0; i < label.length; i++) {
        col = col * 26 + (label.charCodeAt(i) - 64)
      }
      return Math.max(max, col)
    }, 0)

    for (let r = 0; r < Math.max(maxRow, 1); r++) {
      html += `<tr>`
      for (let c = 0; c < Math.max(maxCol, 1); c++) {
        const key = `${String.fromCharCode(65 + c)}${r + 1}`
        const cell = cells[key] || { value: "" }
        const style = cell.format ? `style="` + 
          (cell.format.bold ? 'font-weight: bold;' : '') +
          (cell.format.italic ? 'font-style: italic;' : '') +
          (cell.format.align ? `text-align: ${cell.format.align};` : '') +
          `"` : ""
        html += `<td ${style}>${cell.value || ""}</td>`
      }
      html += `</tr>`
    }
    html += `</table>`

    try {
      await exportDocument({
        content: `<h1>${document.title || 'Spreadsheet'}</h1>` + html,
        from: 'html',
        to: 'pdf',
        filename: document.title || 'spreadsheet'
      })
    } catch (error) {
      console.error('PDF Export failed:', error)
      alert('Professional PDF export failed. Is the export service running?')
    }
  }

  return (
    <div className="h-12 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 flex items-center px-4 gap-4">
      <div className="flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-4">
        <FileSpreadsheet size={18} className="text-green-600" />
        <span className="font-semibold text-sm">Spreadsheet</span>
      </div>

      <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-4">
        <button 
          onClick={() => updateFormat({ bold: !activeCellFormat.bold })}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${activeCellFormat.bold ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "text-gray-600 dark:text-gray-400"}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button 
          onClick={() => updateFormat({ italic: !activeCellFormat.italic })}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${activeCellFormat.italic ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "text-gray-600 dark:text-gray-400"}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
        <button 
          onClick={() => updateFormat({ align: "left" })}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${activeCellFormat.align === "left" || !activeCellFormat.align ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "text-gray-600 dark:text-gray-400"}`}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button 
          onClick={() => updateFormat({ align: "center" })}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${activeCellFormat.align === "center" ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "text-gray-600 dark:text-gray-400"}`}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button 
          onClick={() => updateFormat({ align: "right" })}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${activeCellFormat.align === "right" ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "text-gray-600 dark:text-gray-400"}`}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
      </div>
      <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-gray-900 px-3 py-1 rounded-md border border-gray-200 dark:border-gray-800 focus-within:ring-1 focus-within:ring-green-500 min-w-[200px]">
        <span className="text-xs font-mono text-gray-400">
          {selectedCell ? `${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row + 1}` : "fx"}
        </span>
        <input 
          type="text" 
          value={formulaValue || ""}
          onChange={(e) => setFormulaValue(e.target.value)}
          placeholder="Enter formula or value..."
          className="bg-transparent border-none outline-none text-sm w-full"
        />
      </div>
      
      <div className="ml-auto flex items-center gap-3">
        <button 
          onClick={exportToXLSX}
          className="spreadsheet-export-btn"
          title="Export as XLSX"
        >
          <Download size={16} strokeWidth={2.5} />
          <span>Excel</span>
        </button>
        <button 
          onClick={exportToPDF}
          className="spreadsheet-export-btn bg-red-700 border-red-800"
          title="Export as PDF (Pro)"
          style={{ backgroundColor: '#b91c1c', borderColor: '#991b1b' }}
        >
          <FileDown size={16} strokeWidth={2.5} />
          <span>PDF</span>
        </button>
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1" />
        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400">
           <Calculator size={18} />
        </button>
      </div>
    </div>
  )
}
