import React, { lazy } from "react"
import { SpreadsheetIcon } from "lucide-react"
import type { Plugin } from "@opensuite/plugin-api"
import { createDocument } from "@opensuite/core"
import type { Document } from "@opensuite/core"
import dynamic from "next/dynamic"

const SpreadsheetEditor = dynamic(() => import("./editor"), { 
  ssr: false,
  loading: () => <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-8 min-h-screen animate-pulse" />
})

const SpreadsheetToolbar = dynamic(() => import("./toolbar"), {
  ssr: false,
  loading: () => <div className="h-12 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 animate-pulse" />
})

export const plugin: Plugin = {
  id: "spreadsheet",
  name: "Spreadsheet",
  version: "0.0.1",
  icon: "Table2", // Using string icon name for consistency if preferred, or Lucide name
  documentType: "spreadsheet",
  createDocument: (title: string) => {
    return createDocument("spreadsheet", title)
  },
  loadDocument: (raw: unknown) => raw as Document,
  saveDocument: (doc: Document) => doc,
  Editor: SpreadsheetEditor,
  Toolbar: SpreadsheetToolbar,
  exporters: {
    xlsx: {
      format: "xlsx",
      label: "Excel Spreadsheet (.xlsx)",
    },
    csv: {
      format: "csv",
      label: "Comma Separated Values (.csv)",
    }
  },
  capabilities: {
    export: ["xlsx", "csv"],
  },
}

export default plugin
