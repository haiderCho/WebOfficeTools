"use client"

import Link from "next/link"
import { useEffect, MouseEvent } from "react"
import { useUIStore } from "../../store/uiStore"
import { useDocumentStore } from "../../store/documentStore"
import { formatRelativeTime, capitalize } from "@opensuite/utils"
import { Edit2, Trash2, Search, HelpCircle } from "lucide-react"
import { DocumentIcon } from "../../lib/iconUtils"


export function Sidebar() {
  const { sidebarOpen, toggleCommandPalette } = useUIStore()
  const { documents, fetchDocuments, isLoading, deleteDocument, renameDocument } = useDocumentStore()

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  if (!sidebarOpen) return null

  return (
    <aside
      className="flex flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shrink-0 overflow-hidden"
      style={{ width: "var(--sidebar-width)" }}
    >
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={toggleCommandPalette}
          className="w-full h-9 px-3 flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all text-sm group"
        >
          <Search size={16} className="group-hover:text-blue-500" />
          <span className="flex-1 text-left">Search docs...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-1.5 font-mono text-[10px] font-medium text-gray-500 opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Header */}
      <div className="p-4 pb-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Documents
        </h2>
      </div>

      {/* Document list */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-xs text-gray-400 px-2 py-4 text-center">
            No documents yet
          </p>
        ) : (
          documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/editor/${doc.id}`}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
            >
              <span className="shrink-0 flex items-center justify-center">
                <DocumentIcon type={doc.type} className="w-5 h-5" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {doc.title || "Untitled"}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {capitalize(doc.type)} · {formatRelativeTime(doc.updatedAt)}
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                <button
                  className="p-1 rounded text-gray-400 hover:text-blue-500 hover:bg-white dark:hover:bg-gray-700"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const newTitle = window.prompt("Enter new title:", doc.title)
                    if (newTitle && newTitle !== doc.title) {
                      renameDocument(doc.id, newTitle)
                    }
                  }}
                  title="Rename"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-700"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (window.confirm("Are you sure you want to delete this document?")) {
                      deleteDocument(doc.id)
                    }
                  }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Link>
          ))
        )}
      </nav>

      {/* Footer */}
      <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800">
        <Link
          href="/guide"
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
        >
          <HelpCircle size={18} />
          <span>User Guide & Instructions</span>
        </Link>
      </div>
    </aside>
  )
}
