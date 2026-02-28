import type { Plugin } from "@opensuite/plugin-api"
import { createDocument } from "@opensuite/core"
import type { Document } from "@opensuite/core"
import dynamic from "next/dynamic"
const WordEditor = dynamic(() => import("./Editor"), { 
  ssr: false,
  loading: () => <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-8 min-h-screen animate-pulse" />
})


const WordToolbar = dynamic(() => import("./Toolbar"), {
  ssr: false,
  loading: () => <div className="h-12 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 animate-pulse" />
})




export const plugin: Plugin = {
  id: "word",
  name: "Word Processor",
  icon: "FileText",
  documentType: "word",
  version: "0.0.1",

  blocks: [], // Relies on core blocks

  createDocument: (title: string) => {
    return createDocument("word", title)
  },

  loadDocument: (raw: unknown) => raw as Document,
  saveDocument: (doc: Document) => doc,

  Editor: WordEditor,
  Toolbar: WordToolbar,

  commands: {},
  keymap: {},
  exporters: {
    docx: {
      format: "docx",
      label: "Microsoft Word (.docx)",
      exportServer: async (doc) => {
         // Placeholder for Pandoc service
         return `/api/export/docx/${doc.id}`
      }
    }
  },
  capabilities: {
    export: ["docx", "pdf", "html", "markdown"],
  }
}
