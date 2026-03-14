import React from "react"
import { useSpreadsheetStore } from "./store"
import { Plus, X } from "lucide-react"

export default function SheetTabs({ sheets, activeSheet, onAdd, onSwitch, onDelete }: any) {
  return (
    <div className="h-10 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center px-2 gap-1 overflow-x-auto">
      {sheets.map((sheet: any) => (
        <div 
          key={sheet.id}
          onClick={() => onSwitch(sheet.id)}
          className={`group h-8 px-3 flex items-center gap-2 rounded-t-md cursor-pointer text-xs font-medium transition-colors ${
            activeSheet === sheet.id 
              ? "bg-white dark:bg-gray-800 text-green-600 border-t-2 border-green-500 shadow-sm" 
              : "text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"
          }`}
        >
          <span>{sheet.name}</span>
          {sheets.length > 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(sheet.id); }}
              className="opacity-0 group-hover:opacity-100 hover:text-red-500"
            >
              <X size={12} />
            </button>
          )}
        </div>
      ))}
      <button 
        onClick={onAdd}
        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md text-gray-500"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}
