"use client"

import { create } from 'zustand'

interface LaTeXState {
  // We'll use a signal/event pattern for snippet insertion in the native textarea
  insertionSignal: { snippet: string; id: number } | null
  outline: { id: string; title: string; level: number; line: number }[]
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  uploadSignal: number
  exportSignal: number
  assets: { name: string; data: string }[] 
  
  insertSnippet: (snippet: string) => void
  setOutline: (outline: any[]) => void
  toggleSidebar: () => void
  toggleTheme: () => void
  triggerUpload: () => void
  triggerExport: () => void
  addAsset: (name: string, data: string) => void
  setAssets: (assets: { name: string; data: string }[]) => void
}

export const useLaTeXStore = create<LaTeXState>((set) => ({
  theme: 'light',
  outline: [],
  sidebarOpen: true,
  insertionSignal: null,
  uploadSignal: 0,
  exportSignal: 0,
  assets: [],
  
  insertSnippet: (snippet) => set({ insertionSignal: { snippet, id: Date.now() } }),
  setOutline: (outline) => set({ outline }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  triggerUpload: () => set((state) => ({ uploadSignal: state.uploadSignal + 1 })),
  triggerExport: () => set((state) => ({ exportSignal: state.exportSignal + 1 })),
  addAsset: (name, data) => set((state) => ({ 
    assets: [...state.assets.filter(a => a.name !== name), { name, data }] 
  })),
  setAssets: (assets) => set({ assets })
}))
