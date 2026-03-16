"use client"

import { useEffect, useState } from "react"
import type { Document } from "@opensuite/core"
import type { Plugin } from "@opensuite/plugin-api"
import { Skeleton } from "@opensuite/ui"
import { useDocumentStore } from "../store/documentStore"
import { useUIStore } from "../store/uiStore"

interface EditorHostProps {
  docId: string
}

export function EditorHost({ docId }: EditorHostProps) {
  const [document, setDocument] = useState<Document | null>(null)
  const [plugin, setPlugin] = useState<Plugin | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const saveDocument = useDocumentStore(s => s.saveDocument)
  const setStats = useDocumentStore(s => s.setStats)
  const theme = useUIStore(s => s.theme)

  const [isDirty, setIsDirty] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])


  // Fetch document
  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch(`/api/documents/${docId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Document not found")
        return res.json()
      })
      .then((doc: Document) => {
        setDocument(doc)
        // Dynamically import the plugin for this document type
        return import("@opensuite/plugin-api").then((mod) =>
          mod.loadPlugin(doc.type)
        )
      })
      .then((p) => {
        setPlugin(p)
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load")
        setLoading(false)
      })
  }, [docId])

  // Auto-save logic
  useEffect(() => {
    if (!isDirty || !document) return

    const timer = setTimeout(() => {
      saveDocument(document)
      setIsDirty(false)
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [document, isDirty, saveDocument])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col p-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-5/6" />
      </div>
    )
  }

  if (error || !document || !plugin) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-4xl">😕</div>
          <p className="text-gray-500">{error || "Something went wrong"}</p>
        </div>
      </div>
    )
  }

  const EditorComponent = plugin.Editor
  const ToolbarComponent = plugin.Toolbar


  const handleChange = (updatedDoc: Document) => {
    setDocument(updatedDoc)
    setIsDirty(true)
  }

  const handleStatsUpdate = (stats: { words: number; chars: number }) => {
    setStats(stats)
  }

  if (!isMounted) {

    return (
      <div className="flex-1 flex flex-col space-y-4 p-8">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Plugin Toolbar */}
      <ToolbarComponent document={document} onChange={handleChange} theme={theme} />
      {/* Plugin Editor */}
      <div className="flex-1 overflow-auto">
        <EditorComponent 
          document={document} 
          onChange={handleChange} 
          onStatsUpdate={handleStatsUpdate}
          theme={theme}
        />

      </div>
    </div>
  )
}
