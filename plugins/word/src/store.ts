import { create } from "zustand"
import type { Editor } from "@tiptap/react"

interface WordState {
  editor: Editor | null
  zoom: number
  setEditor: (editor: Editor | null) => void
  setZoom: (zoom: number) => void
}


export const useWordStore = create<WordState>((set) => ({
  editor: null,
  zoom: 100,
  setEditor: (editor) => set({ editor }),
  setZoom: (zoom) => set({ zoom }),
}))
