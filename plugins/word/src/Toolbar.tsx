import type { ToolbarProps } from "@opensuite/plugin-api"
import { 
  Bold, Italic, Heading1, Heading2, List, ListOrdered, 
  Quote, Minus, Undo, Redo, Code, Link as LinkIcon, 
  Eraser, Type, Underline as UnderlineIcon, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Highlighter, Palette, Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon, CheckSquare,
  Table as TableIcon, FileDown, Plus, Trash2,
  Rows, Columns, Strikethrough as StrikethroughIcon,
  Search, Replace, Smile, Image as ImageIcon,
  List as TableOfContents, Eye, Maximize2, Layout
} from "lucide-react"
import { useWordStore } from "./store"
import { useState, useRef } from "react"
import EmojiIconPicker from "./EmojiIconPicker"

export default function WordToolbar({ document, onChange }: ToolbarProps) {

  const { 
    editor, zoom, setZoom, 
    pageSize, setPageSize, 
    margin, setMargin, 
    readMode, setReadMode 
  } = useWordStore()
  
  const [showColorPicker, setShowColorPicker] = useState<"text" | "highlight" | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showFindReplace, setShowFindReplace] = useState(false)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const imageInputRef = useRef<HTMLInputElement>(null)

  if (!editor) {
    return <div className="h-12 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 sticky top-0 z-10" />
  }

  const exportToDocx = async () => {
    const { exportDocx } = await import("./Exporter")
    exportDocx(editor, { pageSize, margin })
  }

  const exportToPdf = async () => {
    const { exportPdf } = await import("./Exporter")
    exportPdf(editor, { pageSize, margin })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (readerEvent) => {
        const url = readerEvent.target?.result
        if (typeof url === 'string') {
          editor.chain().focus().setImage({ src: url }).run()
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const generateTOC = () => {
    // Basic TOC insertion: usually requires a specific node or just manual insertion
    // For now, let's just insert a "Table of Contents" text and list the headings
    const headings: any[] = []
    editor.state.doc.descendants((node: any) => {
      if (node.type.name === 'heading') {
        headings.push({
          level: node.attrs.level,
          text: node.textContent,
        })
      }
    })

    if (headings.length === 0) return

    let tocHtml = "<h2>Table of Contents</h2><ul>"
    headings.forEach(h => {
      tocHtml += `<li style="margin-left: ${(h.level - 1) * 20}px">${h.text}</li>`
    })
    tocHtml += "</ul><hr/>"

    editor.chain().focus().insertContent(tocHtml).run()
  }

  const fonts = [
    'Inter', 'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Tahoma',
    'Calibri', 'Cambria', 'Garamond', 'Roboto', 'Montserrat', 'Open Sans', 'Playfair Display', 
    'Lora', 'Merriweather'
  ]

  return (
    <div className="flex flex-col border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 sticky top-0 z-10 select-none">
      {/* Search and Replace Bar - Overlays Top when Active */}
      {showFindReplace && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30">
          <Search size={14} className="text-blue-500" />
          <input 
            className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500" 
            placeholder="Find..."
            value={searchTerm}
            autoFocus
            onChange={(e) => {
              setSearchTerm(e.target.value)
              editor.commands.setSearchTerm(e.target.value)
            }}
          />
          <input 
            className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500" 
            placeholder="Replace with..."
            value={replaceTerm}
            onChange={(e) => {
              setReplaceTerm(e.target.value)
              editor.commands.setReplaceTerm(e.target.value)
            }}
          />
          <div className="flex gap-1">
            <button 
              onClick={() => editor.commands.replace()}
              className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold hover:bg-blue-700"
            >
              Replace
            </button>
            <button 
              onClick={() => editor.commands.replaceAll()}
              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-bold hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              All
            </button>
            <button 
              onClick={() => setShowFindReplace(false)}
              className="ml-1 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Row 1: Configuration, File, View */}
      <div className="flex items-center gap-1 px-3 py-1 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800/50">
        {/* File & Export Group */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 dark:border-gray-700">
          <ToolbarButton 
            icon={<FileDown size={14} className="text-green-600" />} 
            label="Export to DOCX" 
            onClick={exportToDocx} 
          />
          <ToolbarButton 
            icon={<FileDown size={14} className="text-red-500" />} 
            label="Export to PDF" 
            onClick={exportToPdf} 
          />
        </div>

        {/* Page Setup Group */}
        <div className="flex items-center gap-1.5 px-2 border-r border-gray-200 dark:border-gray-700">
           <Layout size={14} className="text-gray-400" />
           <select 
            className="h-6 px-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] font-bold outline-none cursor-pointer hover:border-blue-400"
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value as any)}
          >
            <option value="A4">A4</option>
            <option value="A3">A3</option>
            <option value="Letter">Letter</option>
            <option value="Tabloid">Tabloid</option>
          </select>

          <select 
            className="h-6 px-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] font-bold outline-none cursor-pointer hover:border-blue-400"
            value={margin}
            onChange={(e) => setMargin(e.target.value as any)}
          >
            <option value="normal">Normal</option>
            <option value="narrow">Narrow</option>
            <option value="wide">Wide</option>
          </select>
        </div>

        {/* View Group */}
        <div className="flex items-center gap-0.5 px-2 border-r border-gray-200 dark:border-gray-700">
          <ToolbarButton 
            icon={<Search size={14} />} 
            label="Find/Replace" 
            active={showFindReplace}
            onClick={() => setShowFindReplace(!showFindReplace)} 
          />
          <ToolbarButton 
            icon={<Eye size={14} />} 
            label="Read Mode" 
            active={readMode}
            onClick={() => setReadMode(!readMode)} 
          />
        </div>

        {/* Zoom Group (Integrated into top row) */}
        <div className="flex items-center gap-2 pl-2">
           <Maximize2 size={13} className="text-gray-400" />
           <div className="flex items-center gap-2">
            <input 
              type="range" 
              min="50" 
              max="150" 
              step="10"
              value={zoom}
              onChange={(e) => setZoom(parseInt(e.target.value))}
              className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-[10px] font-bold text-gray-500 w-8">{zoom}%</span>
           </div>
        </div>
      </div>

      {/* Row 2: Editing Tools */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-1 bg-white dark:bg-gray-950">
        {/* History Group */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 dark:border-gray-700">
          <ToolbarButton 
            icon={<Undo size={14} />} 
            label="Undo" 
            onClick={() => editor.chain().focus().undo().run()} 
            disabled={!editor.can().undo()}
          />
          <ToolbarButton 
            icon={<Redo size={14} />} 
            label="Redo" 
            onClick={() => editor.chain().focus().redo().run()} 
            disabled={!editor.can().redo()}
          />
        </div>

        {/* Typography Group */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-200 dark:border-gray-700 relative">
          <select 
            onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
            className="h-7 px-1.5 bg-gray-50 dark:bg-gray-800 border-none rounded text-xs focus:ring-1 focus:ring-blue-500 w-24 font-medium"
            value={editor.getAttributes('textStyle').fontFamily || "Inter"}
          >
            {fonts.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <select 
            onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
            className="h-7 px-1 bg-gray-50 dark:bg-gray-800 border-none rounded text-xs focus:ring-1 focus:ring-blue-500 w-14"
            value={editor.getAttributes('textStyle').fontSize || "12pt"}
          >
            {[8,9,10,11,12,14,16,18,20,24,30,36].map(s => (
              <option key={s} value={`${s}pt`}>{s}</option>
            ))}
          </select>

          <div className="flex items-center relative ml-1">
            <ToolbarButton 
              icon={<Palette size={14} />} 
              label="Text Color" 
              onClick={() => setShowColorPicker(showColorPicker === "text" ? null : "text")} 
            />
            <ToolbarButton 
              icon={<Highlighter size={14} />} 
              label="Highlight Color" 
              onClick={() => setShowColorPicker(showColorPicker === "highlight" ? null : "highlight")} 
            />
            {showColorPicker && (
              <div className="absolute top-full left-0 z-[100] mt-1 p-2 bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 rounded grid grid-cols-5 gap-1 min-w-[120px]">
                {['#000000', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#ffffff'].map(c => (
                  <button 
                    key={c}
                    className="w-5 h-5 rounded border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                    onClick={() => {
                      if (showColorPicker === "text") {
                        editor.chain().focus().setColor(c).run()
                      } else {
                        editor.chain().focus().toggleHighlight({ color: c }).run()
                      }
                      setShowColorPicker(null)
                    }}
                  />
                ))}
                <button 
                  className="col-span-5 text-[9px] font-bold py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded border-t border-gray-100 dark:border-gray-700 mt-1"
                  onClick={() => {
                    if (showColorPicker === "text") {
                        editor.chain().focus().unsetColor().run()
                      } else {
                        editor.chain().focus().unsetHighlight().run()
                      }
                      setShowColorPicker(null)
                  }}
                >
                  Clear Color
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Basic Styles Group */}
        <div className="flex items-center gap-0.5 px-2 border-r border-gray-200 dark:border-gray-700">
          <ToolbarButton 
            icon={<Bold size={15} />} 
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()} 
            label="Bold"
          />
          <ToolbarButton 
            icon={<Italic size={15} />} 
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            label="Italic"
          />
          <ToolbarButton 
            icon={<UnderlineIcon size={15} />} 
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()} 
            label="Underline"
          />
          <ToolbarButton 
            icon={<StrikethroughIcon size={15} />} 
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()} 
            label="Strikethrough"
          />
          <ToolbarButton 
            icon={<Code size={15} />} 
            active={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()} 
            label="Code"
          />
        </div>

        {/* Alignment & Lists Group */}
        <div className="flex items-center gap-0.5 px-2 border-r border-gray-200 dark:border-gray-700">
          <ToolbarButton 
            icon={<AlignCenter size={15} />} 
            label="Center" 
            active={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()} 
          />
          <ToolbarButton 
            icon={<List size={15} />} 
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()} 
            label="Bullets"
          />
          <ToolbarButton 
            icon={<CheckSquare size={15} />} 
            active={editor.isActive('taskList')}
            onClick={() => editor.chain().focus().toggleTaskList().run()} 
            label="Tasks"
          />
        </div>

        {/* Headings & Script Group */}
        <div className="flex items-center gap-0.5 px-2 border-r border-gray-200 dark:border-gray-700">
          <ToolbarButton 
            icon={<Heading1 size={14} />} 
            active={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
            label="H1"
          />
          <ToolbarButton 
            icon={<Heading2 size={14} />} 
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
            label="H2"
          />
          <ToolbarButton 
            icon={<SubscriptIcon size={14} />} 
            active={editor.isActive('subscript')}
            onClick={() => editor.chain().focus().toggleSubscript().run()} 
            label="Subscript"
          />
          <ToolbarButton 
            icon={<SuperscriptIcon size={14} />} 
            active={editor.isActive('superscript')}
            onClick={() => editor.chain().focus().toggleSuperscript().run()} 
            label="Superscript"
          />
        </div>

        {/* Dynamic Table & Content Group */}
        <div className="flex items-center gap-0.5 pl-2 relative">
          <ToolbarButton 
            icon={<ImageIcon size={15} />} 
            label="Image" 
            onClick={() => imageInputRef.current?.click()} 
          />
          <ToolbarButton 
            icon={<TableIcon size={15} />} 
            label="Table" 
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} 
          />
          <ToolbarButton 
            icon={<Smile size={15} />} 
            active={showEmojiPicker}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
            label="Emoji"
          />
          {showEmojiPicker && (
            <div className="absolute top-full left-0 z-[100] mt-1">
              <EmojiIconPicker 
                onSelect={(emoji) => editor.chain().focus().insertContent(emoji).run()}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}
          <input 
            type="file" 
            ref={imageInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
      </div>
    </div>
  )
}

function ToolbarButton({ icon, label, active, onClick, disabled }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={label}
      disabled={disabled}
      className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${active ? 'bg-gray-100 dark:bg-gray-800 text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
    >
      {icon as any}
    </button>
  )
}
