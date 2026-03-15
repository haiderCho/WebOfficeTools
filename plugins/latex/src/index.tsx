import type { Plugin } from "@opensuite/plugin-api"
import { createDocument } from "@opensuite/core"
import type { Document } from "@opensuite/core"
import dynamic from "next/dynamic"

const LaTeXEditor = dynamic(() => import("./Editor"), { 
  ssr: false,
  loading: () => <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-8 min-h-screen animate-pulse" />
})

const LaTeXToolbar = dynamic(() => import("./Toolbar"), {
  ssr: false,
  loading: () => <div className="h-12 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 animate-pulse" />
})

export const plugin: Plugin = {
  id: "latex",
  name: "LaTeX Editor",
  icon: "FileCode",
  documentType: "latex",
  version: "0.0.1",

  blocks: [],

  createDocument: (title: string) => {
    return createDocument("latex", title)
  },

  loadDocument: (raw: unknown) => raw as Document,
  saveDocument: (doc: Document) => doc,

  Editor: LaTeXEditor,
  Toolbar: LaTeXToolbar,

  commands: {},
  keymap: {},
  exporters: {
    pdf: {
      format: "pdf",
      label: "PDF Document (.pdf)",
      exportServer: async (doc) => {
         return `/api/export/pdf/${doc.id}`
      }
    }
  },
  capabilities: {
    export: ["pdf", "tex"],
  }
}
