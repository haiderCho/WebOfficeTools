"use client"
import { useDocumentStore } from "../../store/documentStore"

export function StatusBar() {
  const isSaving = useDocumentStore(s => s.isSaving)
  const stats = useDocumentStore(s => s.stats)
  
  return (
    <footer
      className="flex items-center justify-between px-4 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shrink-0"
      style={{ height: "var(--statusbar-height)" }}
    >
      <div className="flex items-center gap-4">
        <span>Page {stats.pages || 1}</span>
        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
        <span>Words: {stats.words || 0}</span>
        <span>Chars: {stats.chars || 0}</span>
      </div>

      <div className="flex items-center gap-4">
        {isSaving ? (
           <span className="flex items-center gap-1.5 animate-pulse text-blue-500">
             <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
             Saving...
           </span>
        ) : (
           <span className="text-emerald-500">Saved ✓</span>
        )}
      </div>
    </footer>
  )
}
