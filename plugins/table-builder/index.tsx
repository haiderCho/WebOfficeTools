import type { Plugin, EditorProps, ToolbarProps } from "@opensuite/plugin-api"
import { createDocument } from "@opensuite/core"
import type { Document, TableGraphProps, TableGraphColumn, TableGraphCell } from "@opensuite/core"
import { PlusCircle, Columns, Rows, Trash2, Edit3, Settings, Save, Layout } from "lucide-react"

// =============================================================================
// Table Builder Editor
// =============================================================================

function TableEditor({ document, onChange }: EditorProps) {
  const block = document.blocks[0]
  if (!block || block.type !== "table-graph") return null
  
  const props = block.props as unknown as TableGraphProps
  const { columns, cells } = props

  const addCell = (columnId: string) => {
    const newCell: TableGraphCell = {
      id: crypto.randomUUID(),
      columnId,
      content: "New Cell",
    }
    
    onChange({
      ...document,
      blocks: [{
        ...block,
        props: {
          ...props,
          cells: [...cells, newCell]
        }
      }]
    })
  }

  const editCell = (cellId: string, content: string) => {
    const nextCells = cells.map(c => c.id === cellId ? { ...c, content } : c)
    onChange({
      ...document,
      blocks: [{
        ...block,
        props: {
          ...props,
          cells: nextCells
        }
      }]
    })
  }

  return (
    <div className="flex-1 flex flex-col p-8 bg-gray-50 dark:bg-gray-900 overflow-auto">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 overflow-hidden">
          <div className="overflow-x-auto pb-4">
            {columns.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <p className="text-gray-500">No columns yet. Use the toolbar to add one.</p>
              </div>
            ) : (
              <div className="flex gap-4 min-w-max">
                {columns.map((col) => (
                  <div key={col.id} className="w-56 space-y-3">
                    <div className="group relative p-3 bg-gray-100 dark:bg-gray-700 rounded-md font-semibold text-center text-sm border border-transparent hover:border-blue-400 transition-all">
                      <span className="truncate block">Column {col.id.slice(0, 4)}</span>
                      <button className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 p-1 bg-red-500 text-white rounded-full shadow-lg transition-opacity">
                         <Trash2 size={10} />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                    {cells
                      .filter((c) => c.columnId === col.id)
                      .map((cell) => (
                        <div
                          key={cell.id}
                          className="group relative p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm text-sm hover:ring-2 hover:ring-blue-500/50 transition-all"
                        >
                          <textarea
                            className="w-full bg-transparent border-none focus:ring-0 resize-none p-0"
                            value={cell.content}
                            onChange={(e) => editCell(cell.id, e.target.value)}
                            rows={1}
                          />
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => addCell(col.id)}
                      className="w-full py-2 text-xs border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-all flex items-center justify-center gap-1"
                    >
                      <PlusCircle size={14} /> Add Item
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg flex gap-3 items-start">
          <Settings className="text-blue-600 dark:text-blue-400 mt-0.5" size={16} />
          <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
            <strong>Pro Tip:</strong> Independent stacks allow you to build asymmetrical layouts. 
            Perfect for Kanban boards, feature comparisons, or structured research notes.
          </p>
        </div>
      </div>
    </div>
  )
}

function TableToolbar({ document, onChange }: ToolbarProps) {
  const block = document.blocks[0]
  if (!block || block.type !== "table-graph") return <div className="h-12 border-b" />
  
  const props = block.props as unknown as TableGraphProps

  const addColumn = () => {
    const newCol: TableGraphColumn = { id: crypto.randomUUID(), width: 220 }
    onChange({
      ...document,
      blocks: [{
        ...block,
        props: {
          ...props,
          columns: [...props.columns, newCol]
        }
      }]
    })
  }

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 sticky top-0 z-10">
      <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-4">
        <Layout size={16} className="text-gray-400 mr-1" />
        <select className="text-xs bg-transparent border-none focus:ring-0 font-medium cursor-pointer">
          <option>Independent Stacks</option>
          <option>Strict Grid</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <IconButton 
          icon={<Columns size={18} />} 
          label="Add Column" 
          onClick={addColumn}
        />
        <IconButton 
          icon={<Rows size={18} />} 
          label="Add Global Row" 
          disabled
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <IconButton icon={<Save size={18} />} label="Export PDF" />
      </div>
    </div>
  )
}

function IconButton({ icon, label, onClick, disabled }: { icon: React.ReactNode, label: string, onClick?: () => void, disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed group relative transition-colors"
    >
      {icon}
      <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
        {label}
      </span>
    </button>
  )
}

export const plugin: Plugin = {
  id: "table-builder",
  name: "Table Builder",
  icon: "Grid",
  documentType: "table",
  version: "0.1.0",

  blocks: [
    { type: "table-graph", defaultProps: { columns: [], cells: [] } }
  ],

  createDocument: (title: string) => {
    const doc = createDocument("table", title)
    doc.blocks = [
      {
        id: crypto.randomUUID(),
        type: "table-graph",
        props: { columns: [], cells: [] },
        content: [],
        children: [],
      },
    ]
    return doc
  },
  loadDocument: (raw: unknown) => raw as Document,
  saveDocument: (doc: Document) => doc,

  Editor: TableEditor,
  Toolbar: TableToolbar,

  commands: {},
  keymap: {},
  exporters: {
    pdf: {
      format: "pdf",
      label: "Printable PDF",
    },
  },
  capabilities: {
    export: ["pdf"],
  },
}
