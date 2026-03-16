import type { Plugin } from "@opensuite/plugin-api"
import { createDocument } from "@opensuite/core"
import type { Document } from "@opensuite/core"
// @ts-ignore
import dynamic from "next/dynamic"

const MarkdownEditor = dynamic(() => import("./Editor"), { 
  ssr: false,
  loading: () => <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-8 min-h-screen animate-pulse" />
})

const MarkdownToolbar = dynamic(() => import("./Toolbar"), {
  ssr: false
})

export const plugin: Plugin = {
  id: "markdown",
  name: "Markdown Editor",
  icon: "FileText",
  documentType: "markdown",
  version: "0.0.1",

  blocks: [],

  createDocument: (title: string) => {
    return createDocument("markdown", title)
  },

  loadDocument: (raw: unknown) => raw as Document,
  saveDocument: (doc: Document) => doc,

  Editor: MarkdownEditor,
  Toolbar: MarkdownToolbar,

  commands: {},
  keymap: {},
  exporters: {
    pdf: {
      format: "pdf",
      label: "PDF Document (.pdf)",
      exportServer: async (doc) => {
         return `/api/export/pdf/${doc.id}`
      }
    },
    html: {
      format: "html",
      label: "HTML Document (.html)",
      exportServer: async (doc) => {
         return `/api/export/html/${doc.id}`
      }
    }
  },
  capabilities: {
    export: ["pdf", "html", "markdown"],
  }
}
