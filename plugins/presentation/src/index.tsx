import React, { lazy } from "react"
import { Presentation } from "lucide-react"
import type { Plugin } from "@opensuite/plugin-api"
import { createDocument } from "@opensuite/core"
import type { Document } from "@opensuite/core"
import dynamic from "next/dynamic"

const PresentationEditor = dynamic(() => import("./editor"), { 
  ssr: false,
  loading: () => <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-8 min-h-screen animate-pulse" />
})

const PresentationToolbar = dynamic(() => import("./toolbar"), {
  ssr: false,
  loading: () => <div className="h-12 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 animate-pulse" />
})

export const plugin: Plugin = {
  id: "presentation",
  name: "Presentation",
  version: "0.0.1",
  icon: "Presentation",
  documentType: "slides",
  createDocument: (title: string) => {
    const doc = createDocument("slides", title)
    return {
      ...doc,
      slides: [
        {
          id: crypto.randomUUID(),
          layout: "title",
          blocks: [],
        }
      ],
      theme: "modern",
    }
  },
  loadDocument: (raw: unknown) => raw as Document,
  saveDocument: (doc: Document) => doc,
  Editor: PresentationEditor,
  Toolbar: PresentationToolbar,
  blocks: [],
  commands: {},
  keymap: {},
  exporters: {
    pdf: {
      format: "pdf",
      label: "PDF Presentation (.pdf)",
    }
  },
  capabilities: {
    export: ["pdf"] as any,
  },
}

export default plugin
