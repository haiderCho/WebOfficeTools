import type { Document } from "./types/document"

// =============================================================================
// IndexedDB-based local draft persistence
// Uses a simple key-value approach for offline / autosave support
// =============================================================================

interface DraftEntry {
  doc: Document
  savedAt: number
}

const DB_NAME = "opensuite"
const STORE_NAME = "drafts"
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const localStore = {
  async saveDraft(docId: string, doc: Document): Promise<void> {
    const db = await openDB()
    const entry: DraftEntry = { doc, savedAt: Date.now() }
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      tx.objectStore(STORE_NAME).put(entry, `draft:${docId}`)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },

  async loadDraft(docId: string): Promise<DraftEntry | undefined> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly")
      const request = tx.objectStore(STORE_NAME).get(`draft:${docId}`)
      request.onsuccess = () => resolve(request.result as DraftEntry | undefined)
      request.onerror = () => reject(request.error)
    })
  },

  async clearDraft(docId: string): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      tx.objectStore(STORE_NAME).delete(`draft:${docId}`)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },

  async listDrafts(): Promise<string[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly")
      const request = tx.objectStore(STORE_NAME).getAllKeys()
      request.onsuccess = () =>
        resolve(
          (request.result as string[])
            .filter((k) => k.startsWith("draft:"))
            .map((k) => k.replace("draft:", ""))
        )
      request.onerror = () => reject(request.error)
    })
  },
}
