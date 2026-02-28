import type { ToolbarProps } from "@opensuite/plugin-api"
import { 
  Bold, Italic, Heading1, Heading2, List, ListOrdered, 
  Quote, Minus, Undo, Redo, Code, Link as LinkIcon, 
  Eraser, Type
} from "lucide-react"
import { useWordStore } from "./store"

export default function WordToolbar({ document, onChange }: ToolbarProps) {

  const { editor, zoom, setZoom } = useWordStore()


  if (!editor) {
    return <div className="h-12 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 sticky top-0 z-10" />
  }

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 sticky top-0 z-10 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1 pr-2 border-r border-gray-200 dark:border-gray-700">
        <select 
          className="h-9 px-2 bg-gray-50 dark:bg-gray-800 border-none rounded text-xs font-semibold focus:ring-1 focus:ring-blue-500"
          value="A4"
          disabled
        >
          <option value="A4">A4 Page</option>
        </select>

        <div className="flex items-center gap-2 ml-4">
          <span className="text-[10px] font-medium text-gray-400 w-10">{zoom}%</span>
          <input 
            type="range" 
            min="25" 
            max="200" 
            step="5"
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
            className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>


      <div className="flex items-center gap-1 pr-2 border-r border-gray-200 dark:border-gray-700">

        <ToolbarButton 
          icon={<Undo size={18} />} 
          label="Undo" 
          onClick={() => editor.chain().focus().undo().run()} 
          disabled={!editor.can().undo()}
        />
        <ToolbarButton 
          icon={<Redo size={18} />} 
          label="Redo" 
          onClick={() => editor.chain().focus().redo().run()} 
          disabled={!editor.can().redo()}
        />
      </div>

      <div className="flex items-center gap-1 px-2 border-r border-gray-200 dark:border-gray-700">
        <select 
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
          className="h-9 px-2 bg-gray-50 dark:bg-gray-800 border-none rounded text-xs focus:ring-1 focus:ring-blue-500 w-32"
          value={editor.getAttributes('textStyle').fontFamily || "Inter"}
        >
          {['Inter', 'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Tahoma'].map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <select 
          onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}

          className="h-9 px-2 bg-gray-50 dark:bg-gray-800 border-none rounded text-xs focus:ring-1 focus:ring-blue-500"
          value={editor.getAttributes('textStyle').fontSize || "12pt"}
        >
          {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72].map(s => (
            <option key={s} value={`${s}pt`}>{s}</option>
          ))}
        </select>

        <select 
          onChange={(e) => editor.chain().focus().setLineHeight(e.target.value).run()}
          className="h-9 px-2 bg-gray-50 dark:bg-gray-800 border-none rounded text-xs focus:ring-1 focus:ring-blue-500"
          value={editor.getAttributes('paragraph').lineHeight || "1.0"}
        >

          {['1.0', '1.15', '1.5', '2.0', '2.5', '3.0'].map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1 px-2 border-r border-gray-200 dark:border-gray-700">

        <ToolbarButton 
          icon={<Heading1 size={18} />} 
          label="Heading 1" 
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
        />
        <ToolbarButton 
          icon={<Heading2 size={18} />} 
          label="Heading 2" 
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
        />
        <ToolbarButton 
          icon={<Type size={18} />} 
          label="Paragraph" 
          active={editor.isActive('paragraph')}
          onClick={() => editor.chain().focus().setParagraph().run()} 
        />
      </div>
      
      <div className="flex items-center gap-1 px-2 border-r border-gray-200 dark:border-gray-700">
        <ToolbarButton 
          icon={<Bold size={18} />} 
          label="Bold" 
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()} 
        />
        <ToolbarButton 
          icon={<Italic size={18} />} 
          label="Italic" 
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()} 
        />
        <ToolbarButton 
          icon={<Code size={18} />} 
          label="Inline Code" 
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()} 
        />
      </div>

      <div className="flex items-center gap-1 px-2 border-r border-gray-200 dark:border-gray-700">
        <ToolbarButton 
          icon={<List size={18} />} 
          label="Bullet List" 
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
        />
        <ToolbarButton 
          icon={<ListOrdered size={18} />} 
          label="Ordered List" 
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
        />
      </div>

      <div className="flex items-center gap-1 px-2 border-r border-gray-200 dark:border-gray-700">
        <ToolbarButton 
          icon={<Quote size={18} />} 
          label="Blockquote" 
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
        />
        <ToolbarButton 
          icon={<Minus size={18} />} 
          label="Horizontal Rule" 
          onClick={() => editor.chain().focus().setHorizontalRule().run()} 
        />
      </div>

      <div className="flex items-center gap-1 pl-2">
        <ToolbarButton 
          icon={<Eraser size={18} />} 
          label="Clear Formatting" 
          onClick={() => editor.chain().focus().unsetAllMarks().run()} 
        />
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
