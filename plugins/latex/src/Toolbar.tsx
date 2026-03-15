"use client"

import { 
  FileDown, 
  Heading1, 
  Heading2, 
  Hash, 
  Table as TableIcon, 
  Sigma, 
  Image as ImageIcon,
  List,
  MessageSquareCode,
  Zap,
  Printer,
  Sun,
  Moon
} from "lucide-react"
import { useLaTeXStore } from "./store"

export default function LaTeXToolbar() {
  const { insertSnippet, theme, toggleTheme, triggerUpload, triggerExport } = useLaTeXStore()
  
  const isDark = theme === 'dark'
  const bgBar = isDark ? 'bg-[#161b22]' : 'bg-white'
  const borderColor = isDark ? 'border-white/5' : 'border-gray-200'
  const groupBg = isDark ? 'bg-black/20' : 'bg-gray-100'

  return (
    <div className={`h-14 border-b ${borderColor} ${bgBar} flex items-center px-6 justify-between transition-colors`}>
      <div className="flex items-center space-x-1">
        {/* Structure Group */}
        <div className={`flex items-center space-x-0.5 ${groupBg} p-1 rounded-lg border ${borderColor}`}>
           <ToolbarButton 
            icon={<Heading1 size={14} />} 
            label="Section" 
            onClick={() => insertSnippet("\\section{New Section}")} 
           />
           <ToolbarButton 
            icon={<Heading2 size={14} />} 
            label="Sub" 
            onClick={() => insertSnippet("\\subsection{New Subsection}")} 
           />
        </div>

        <div className={`w-[1px] h-4 ${isDark ? 'bg-white/10' : 'bg-gray-200'} mx-2`} />

        {/* Components Group */}
        <div className={`flex items-center space-x-0.5 ${groupBg} p-1 rounded-lg border ${borderColor}`}>
           <ToolbarButton 
            icon={<Sigma size={14} />} 
            label="Math" 
            onClick={() => insertSnippet("\\[\n  E=mc^2\n\\]")} 
           />
           <ToolbarButton 
            icon={<TableIcon size={14} />} 
            label="Table" 
            onClick={() => insertSnippet("\\begin{tabular}{cc}\n  Header L & Header R \\\\\n  \\hline\n  Data 1 & Data 2 \\\\\n  Data 3 & Data 4 \\\\\n\\end{tabular}")} 
           />
           <ToolbarButton 
            icon={<ImageIcon size={14} />} 
            label="Upload" 
            onClick={triggerUpload} 
           />
        </div>

        <div className={`w-[1px] h-4 ${isDark ? 'bg-white/10' : 'bg-gray-200'} mx-2`} />

        {/* Formatting */}
        <div className="flex items-center space-x-0.5">
           <ToolbarButton 
            icon={<List size={14} />} 
            label="List" 
            onClick={() => insertSnippet("\\begin{itemize}\n  \\item First Item\n  \\item Second Item\n\\end{itemize}")} 
           />
           <ToolbarButton 
            icon={<MessageSquareCode size={14} />} 
            label="Note" 
            onClick={() => insertSnippet("% Note: This is a comment")} 
           />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-md border ${borderColor} hover:grow transition-all flex items-center justify-center`}
          title="Toggle Theme"
        >
          {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-gray-400" />}
        </button>

        <div className={`w-[1px] h-6 ${isDark ? 'bg-white/10' : 'bg-gray-200'} mx-1`} />

        <button 
          onClick={triggerExport}
          className="flex items-center space-x-2 px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all shadow-lg active:scale-95 border border-blue-400/20"
        >
           <Zap size={12} fill="white" />
           <span>BUILD PDF</span>
        </button>
      </div>
    </div>
  )
}

function ToolbarButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  const theme = useLaTeXStore(state => state.theme)
  const isDark = theme === 'dark'

  return (
    <button 
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md flex items-center space-x-2 transition-all relative group ${
        isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-black hover:bg-black/5'
      }`}
    >
      {icon}
      <span className="text-[10px] font-bold hidden xl:inline uppercase tracking-tighter">{label}</span>
      <span className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 ${isDark ? 'bg-[#161b22]' : 'bg-white'} text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border ${isDark ? 'border-white/10' : 'border-gray-200'} z-50 shadow-xl`}>
        {label === 'Upload' ? 'Upload local image' : `Insert ${label} command`}
      </span>
    </button>
  )
}
