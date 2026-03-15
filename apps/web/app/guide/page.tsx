"use client"

import Link from "next/link"
import { Sidebar } from "../../components/shell/Sidebar"
import { Topbar } from "../../components/shell/Topbar"
import { 
  Book, 
  Search, 
  FileDown, 
  Table2, 
  FileText, 
  Zap, 
  Keyboard, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  MousePointer2,
  ArrowLeft
} from "lucide-react"

export default function GuidePage() {
  const sections = [
    {
      title: "Getting Started",
      icon: <Zap className="text-yellow-500" />,
      content: "OpenSuite is a unified workspace for your documents, spreadsheets, and presentations. Click the icons in the dashboard center to create a new file or use the sidebar to manage your existing ones.",
      tips: ["Auto-saves every change", "Dark/Light mode support", "Unified dashboard"]
    },
    {
      title: "Universal Search",
      icon: <Search className="text-blue-500" />,
      content: "Instantly find any document across the entire platform. Every document is indexed automatically, searching through titles and deep within the content itself.",
      shortcut: "Ctrl + K",
      features: ["Fuzzy matching", "DocType grouping", "Instant navigation"]
    },
    {
      title: "Professional Export",
      icon: <FileDown className="text-red-500" />,
      content: "Powered by Pandoc, our export engine generates professional-grade PDF and Word documents. This isn't a simple 'Print to PDF'—it preserves high-fidelity formatting and structure.",
      features: ["High-fidelity PDF", "DOCX compatibility", "LaTeX support"]
    },
    {
      title: "Powerful Spreadsheets",
      icon: <Table2 className="text-green-500" />,
      content: "A professional-tier spreadsheet engine with advanced formula support and rich cell formatting. Perfect for everything from simple lists to complex financial models.",
      features: ["Excel-compatible logic", "Rich formatting", "Powerful XLSX export"]
    }
  ]

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-950">
        <Topbar title="User Guide & Instructions" />
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-8 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>

            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                <Book className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 italic tracking-tight">
                  Mastering OpenSuite
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Professional guidelines and quick-start instructions.
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              {sections.map((section, idx) => ( section.features ? (
                <div 
                  key={idx} 
                  className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                      {section.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {section.title}
                        </h2>
                        {section.shortcut && (
                          <kbd className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 text-xs font-mono font-bold text-gray-500">
                            {section.shortcut}
                          </kbd>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                        {section.content}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {section.features.map(f => (
                          <span key={f} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-100 dark:border-blue-800/30">
                            <ShieldCheck size={12} />
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                 <div 
                  key={idx} 
                  className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hover:border-yellow-200 dark:hover:border-yellow-800/50 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                      {section.icon}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {section.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                        {section.content}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         {section.tips?.map(tip => (
                            <div key={tip} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                               <MousePointer2 size={14} className="text-yellow-500" />
                               {tip}
                            </div>
                         ))}
                      </div>
                    </div>
                  </div>
                </div>
              )))}
            </div>

            <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20">
               <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 text-center md:text-left">
                     <h3 className="text-2xl font-bold mb-2 tracking-tight">Need deep dive support?</h3>
                     <p className="text-blue-100 opacity-90 leading-relaxed font-medium">
                        Our technical documentation covers API integration, plugin development, and infrastructure setup.
                     </p>
                  </div>
                  <button className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg whitespace-nowrap">
                     Browse Docs
                     <ExternalLink size={18} />
                  </button>
               </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
