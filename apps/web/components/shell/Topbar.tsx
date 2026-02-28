"use client"

import { useUIStore } from "../../store/uiStore"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, LayoutDashboard } from "lucide-react"

interface TopbarProps {
  title?: string
}

export function Topbar({ title }: TopbarProps) {
  const { toggleSidebar } = useUIStore()
  const pathname = usePathname()
  const isEditor = pathname?.startsWith("/editor")

  return (
    <header
      className="h-12 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0"
      style={{ height: "var(--topbar-height)" }}
    >
      <div className="flex items-center gap-3">
        {/* Sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>

        {isEditor && (
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700 shadow-sm group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Dashboard
          </Link>
        )}

        {/* Logo / App name */}
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {title || "OpenSuite"}
          </h1>
        </div>
      </div>

      {/* Right side — placeholder for user menu, etc. */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Phase 0
        </span>
      </div>
    </header>
  )
}
