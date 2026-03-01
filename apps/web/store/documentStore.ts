"use client"

import { create } from "zustand"
import type { Document } from "@opensuite/core"

// =============================================================================
// Document Store — manages documents list and CRUD operations
// =============================================================================

interface DocumentState {
  documents: Document[]
  activeDocId: string | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  stats: {
    words: number
    chars: number
    pages?: number
  }


  // Actions
  setDocuments: (docs: Document[]) => void
  setActiveDoc: (id: string | null) => void
  addDocument: (doc: Document) => void
  updateDocument: (id: string, updates: Partial<Document>) => void
  removeDocument: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setStats: (stats: { words: number; chars: number; pages?: number }) => void


  // Async operations
  fetchDocuments: () => Promise<void>
  createDocument: (type: string, title: string) => Promise<Document>
  renameDocument: (id: string, newTitle: string) => Promise<void>
  saveDocument: (doc: Document) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  activeDocId: null,
  isLoading: false,
  isSaving: false,
  error: null,
  stats: {
    words: 0,
    chars: 0,
    pages: 1,
  },


  setDocuments: (docs) => set({ documents: docs }),
  setActiveDoc: (id) => set({ activeDocId: id }),
  addDocument: (doc) =>
    set((s) => ({ documents: [...s.documents, doc] })),
  updateDocument: (id, updates) =>
    set((s) => ({
      documents: s.documents.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })),
  removeDocument: (id) =>
    set((s) => ({
      documents: s.documents.filter((d) => d.id !== id),
      activeDocId: s.activeDocId === id ? null : s.activeDocId,
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setStats: (stats) => set({ stats }),


  fetchDocuments: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch("/api/documents")
      if (!res.ok) throw new Error("Failed to fetch documents")
      const docs = await res.json()
      set({ documents: docs, isLoading: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
        isLoading: false,
      })
    }
  },

  createDocument: async (type, title) => {
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, title }),
    })
    if (!res.ok) throw new Error("Failed to create document")
    const doc = await res.json()
    get().addDocument(doc)
    return doc
  },

  saveDocument: async (doc) => {
    set({ isSaving: true })
    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      })
      if (!res.ok) throw new Error("Failed to save document")
      get().updateDocument(doc.id, doc)
    } finally {
      set({ isSaving: false })
    }
  },

  renameDocument: async (id, newTitle) => {
    // Optimistic update
    get().updateDocument(id, { title: newTitle })
    
    const doc = get().documents.find(d => d.id === id)
    if (!doc) return
    
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...doc, title: newTitle }),
      })
      if (!res.ok) throw new Error("Failed to rename document")
    } catch {
      // Rollback not fully implemented, but we could fetch again or show error
      get().setError("Failed to rename document")
    }
  },

  deleteDocument: async (id) => {
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete document")
    get().removeDocument(id)
  },
}))
