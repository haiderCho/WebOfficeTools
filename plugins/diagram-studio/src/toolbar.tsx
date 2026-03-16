"use client"

import React from "react"
import { Save, FileImage, FileText, Share2, Grid3X3, Layers } from "lucide-react"
import type { ToolbarProps } from "@opensuite/plugin-api"

export default function DiagramToolbar({ theme }: ToolbarProps) {
  return (
    <div className="h-12 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 flex items-center px-4 justify-between transition-colors">
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400" title="Library">
          <Layers size={18} />
        </button>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400" title="Grid Settings">
          <Grid3X3 size={18} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-800 mx-2" />
        <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
          <FileImage size={16} />
          <span>Export PNG</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium transition-colors">
          <FileText size={16} />
          <span>PDF</span>
        </button>
      </div>
    </div>
  )
}
