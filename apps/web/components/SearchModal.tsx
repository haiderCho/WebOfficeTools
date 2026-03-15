"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useDocumentStore } from "../store/documentStore"
import { useUIStore } from "../store/uiStore"
import { searchDocuments } from "@opensuite/utils"
import { 
  Search, 
  FileText, 
  Table, 
  Layout, 
  FileCode, 
  Command, 
  X,
  Clock
} from "lucide-react"

export default function SearchModal() {
  const router = useRouter()
  const { documents } = useDocumentStore()
  const { commandPaletteOpen, toggleCommandPalette } = useUIStore()
  
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        toggleCommandPalette()
      }
      if (e.key === "Escape" && commandPaletteOpen) {
        toggleCommandPalette()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [commandPaletteOpen, toggleCommandPalette])

  // Focus input when modal opens
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("")
      setResults([])
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandPaletteOpen])

  // Search logic
  useEffect(() => {
    if (query.length > 0) {
      const filtered = searchDocuments(query, documents)
      setResults(filtered.slice(0, 8)) // Limit to 8 results
      setSelectedIndex(0)
    } else {
      setResults([])
    }
  }, [query, documents])

  const handleSelect = (doc: any) => {
    toggleCommandPalette()
    router.push(`/editor/${doc.id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex(prev => (prev + 1) % results.length)
    } else if (e.key === "ArrowUp") {
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex])
    }
  }

  if (!commandPaletteOpen) return null

  const getIcon = (type: string) => {
    switch (type) {
      case "word": return <FileText className="text-blue-500" size={18} />
      case "spreadsheet": return <Table className="text-green-600" size={18} />
      case "slides": return <Layout className="text-orange-500" size={18} />
      case "markdown": return <FileCode className="text-gray-500" size={18} />
      default: return <FileText className="text-gray-400" size={18} />
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={toggleCommandPalette}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-gray-950 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in slide-in-from-top-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/50">
          <Search className="text-gray-400 mr-3" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-lg text-gray-900 dark:text-gray-100 placeholder-gray-400"
            placeholder="Search documents, content, and more..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] font-bold text-gray-400 uppercase tracking-tighter shadow-sm">
            <Command size={10} />
            K
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-2">
          {query.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="text-gray-400 dark:text-gray-600 mb-2">
                <Search size={32} className="mx-auto opacity-20 mb-3" />
                <p>Start typing to search across your workspace</p>
                <p className="text-xs opacity-60 mt-1">Deep search indexes Word, Spreadsheet, and more.</p>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="px-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Results found in {results.length} documents
              </div>
              {results.map((doc, idx) => (
                <div
                  key={doc.id}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-150
                    ${idx === selectedIndex ? "bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-200 dark:ring-blue-800" : "hover:bg-gray-50 dark:hover:bg-gray-900"}
                  `}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleSelect(doc)}
                >
                  <div className="p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-md shadow-sm">
                    {getIcon(doc.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {doc.title}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                      <span className="capitalize">{doc.type}</span>
                      <span>•</span>
                      <Clock size={10} />
                      <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-12 text-center text-gray-400">
              <X size={32} className="mx-auto opacity-20 mb-3 text-red-500" />
              <p>No results found for "{query}"</p>
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-gray-900/80 flex items-center justify-between text-[11px] text-gray-400 font-medium uppercase tracking-tight">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 border rounded shadow-xs">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 border rounded shadow-xs">Enter</kbd> Open</span>
          </div>
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 border rounded shadow-xs">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  )
}
