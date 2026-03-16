import React from "react"
import { Network } from "lucide-react"
import type { Plugin } from "@opensuite/plugin-api"
import { createDocument } from "@opensuite/core"
import type { Document } from "@opensuite/core"
// @ts-ignore
import dynamic from "next/dynamic"

const DiagramEditor = dynamic(() => import("./editor"), { 
  ssr: false,
  loading: () => <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-8 min-h-screen animate-pulse" />
})

const DiagramToolbar = dynamic(() => import("./toolbar"), {
  ssr: false,
  loading: () => <div className="h-12 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 animate-pulse" />
})

export const plugin: Plugin = {
  id: "diagram-studio",
  name: "Diagram Studio",
  version: "0.0.1",
  icon: "Network",
  documentType: "diagram",
  createDocument: (title: string) => {
    const doc = createDocument("diagram", title)
    return {
      ...doc,
      content: {
        schema: "tldraw/2",
        store: {}, // Tldraw store data will go here
      },
    }
  },
  loadDocument: (raw: unknown) => raw as Document,
  saveDocument: (doc: Document) => doc,
  Editor: DiagramEditor as any,
  Toolbar: DiagramToolbar as any,
  blocks: [],
  commands: {},
  keymap: {},
  exporters: {
    png: {
      format: "png",
      label: "PNG Image (.png)",
    },
    pdf: {
      format: "pdf",
      label: "PDF Document (.pdf)",
    }
  },
  capabilities: {
    export: ["png", "pdf"] as any,
  },
}

export default plugin
