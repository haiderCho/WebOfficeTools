import { create } from "zustand"
import type { Editor } from "@tiptap/react"

interface WordState {
  editor: Editor | null
  zoom: number
  pageSize: 'A3' | 'A4' | 'Letter' | 'Tabloid'
  margin: 'normal' | 'narrow' | 'wide'
  readMode: boolean
  setEditor: (editor: Editor | null) => void
  setZoom: (zoom: number) => void
  setPageSize: (size: 'A3' | 'A4' | 'Letter' | 'Tabloid') => void
  setMargin: (margin: 'normal' | 'narrow' | 'wide') => void
  setReadMode: (mode: boolean) => void
}


export const useWordStore = create<WordState>((set) => ({
  editor: null,
  zoom: 100,
  pageSize: 'A4',
  margin: 'normal',
  readMode: false,
  setEditor: (editor) => set({ editor }),
  setZoom: (zoom) => set({ zoom }),
  setPageSize: (pageSize) => set({ pageSize }),
  setMargin: (margin) => set({ margin }),
  setReadMode: (readMode) => set({ readMode }),
}))
