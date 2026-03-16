"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { ListTree, Maximize2, RotateCcw, CheckCircle2, AlertCircle, Loader2, Sparkles, Moon, Sun, Sidebar as SidebarIcon, ImageIcon, FileCode } from "lucide-react"
import type { EditorProps } from "@opensuite/plugin-api"
import "katex/dist/katex.min.css"
// @ts-ignore
import katex from "katex"
import { useLaTeXStore } from "./store"
import { exportDocument } from "@opensuite/utils"

export default function LaTeXEditor({ document: doc, onChange, onStatsUpdate }: EditorProps) {
  const { theme, toggleTheme, outline, setOutline, sidebarOpen, toggleSidebar, insertionSignal, uploadSignal, exportSignal } = useLaTeXStore()
  
  const [content, setContent] = useState(
    (doc.blocks[0]?.content as unknown as string) || "\\section{Introduction}\n\nType your LaTeX here using $E=mc^2$ or central equations like:\n\n\\[\\sum_{i=1}^n i = \\frac{n(n+1)}{2}\\]"
  )
  
  // Local asset state to handle immediate UI updates
  const [localAssets, setLocalAssets] = useState<any[]>((doc.metadata.assets as any[]) || [])
  const [compiling, setCompiling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [isServiceOnline, setIsServiceOnline] = useState(true)
  
  const previewRef = useRef<HTMLDivElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync local assets when document changes (initial load or external update)
  useEffect(() => {
    if (doc.metadata.assets) {
      setLocalAssets(doc.metadata.assets as any[])
    }
  }, [doc.id])

  // Auto-Scaling Logic
  const updateScale = useCallback(() => {
    if (!previewContainerRef.current) return
    const containerWidth = previewContainerRef.current.offsetWidth
    const padding = 80 
    const paperWidthPx = 8.27 * 96 
    const availableWidth = containerWidth - padding
    
    if (availableWidth < paperWidthPx) {
      setScale(availableWidth / paperWidthPx)
    } else {
      setScale(1)
    }
  }, [])

  useEffect(() => {
    const observer = new ResizeObserver(() => updateScale())
    if (previewContainerRef.current) observer.observe(previewContainerRef.current)
    updateScale()
    return () => observer.disconnect()
  }, [updateScale, sidebarOpen])

  // Handle Image Upload Trigger
  useEffect(() => {
    if (uploadSignal > 0 && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [uploadSignal])

  const insertAtCursor = (snippet: string, assetsOverride?: any[]) => {
    if (!textareaRef.current) return
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const before = text.substring(0, start)
    const after = text.substring(end, text.length)
    const newValue = before + snippet + after
    
    setContent(newValue)
    updateDocumentSync(newValue, assetsOverride || localAssets)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + snippet.length, start + snippet.length)
    }, 0)
  }

  useEffect(() => {
    if (insertionSignal && textareaRef.current) {
      insertAtCursor(insertionSignal.snippet)
    }
  }, [insertionSignal])

  // PDF Export Logic
  useEffect(() => {
    if (exportSignal > 0) {
      handleExportPDF()
    }
  }, [exportSignal])

  const handleExportPDF = async () => {
    setCompiling(true)
    setError(null)

    try {
      await exportDocument({
        content: content,
        from: 'latex',
        to: 'pdf',
        filename: `latex-${doc.title || 'document'}-${Date.now()}`.replace(/\s+/g, '-').toLowerCase(),
        assets: localAssets
      })
    } catch (err: any) {
      console.error("PDF Export Error:", err)
      setError("Failed to generate PDF. Make sure export-service is running.")
    } finally {
      setCompiling(false)
    }
  }

  // Document Structure Analysis
  useEffect(() => {
    const lines = content.split('\n')
    const newOutline: any[] = []
    lines.forEach((line, index) => {
      const sectionMatch = line.match(/\\(section|subsection|subsubsection)\{(.*?)\}/)
      if (sectionMatch) {
        newOutline.push({
          id: `outline-${index}`,
          title: sectionMatch[2],
          level: sectionMatch[1] === 'section' ? 1 : sectionMatch[1] === 'subsection' ? 2 : 3,
          line: index + 1
        })
      }
    })
    setOutline(newOutline)
  }, [content, setOutline])

  // CRITICAL: Helper to update document with latest state
  const updateDocumentSync = useCallback((newContent: string, newAssets: any[]) => {
    onChange({
      ...doc,
      metadata: {
        ...doc.metadata,
        assets: newAssets
      },
      blocks: [
        { 
          id: "main", 
          type: "latex" as any, 
          props: {}, 
          content: [], 
          children: [], 
          ...({ content: newContent } as any) 
        }
      ],
      updatedAt: new Date().toISOString()
    })
  }, [doc, onChange])

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setContent(value)
    updateDocumentSync(value, localAssets)

    if (onStatsUpdate) {
      onStatsUpdate({
        words: value.split(/\s+/).filter(Boolean).length,
        chars: value.length,
      })
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      const newAsset = { name: file.name, data: base64 }
      
      // Calculate next assets array
      const nextAssets = [...localAssets.filter(a => a.name !== file.name), newAsset]
      
      // Update local state
      setLocalAssets(nextAssets)
      
      const snippet = `\\begin{figure}[h]\n  \\centering\n  \\includegraphics{asset:${file.name}}\n  \\caption{${file.name}}\n\\end{figure}`
      // Sync document with both new content and latest assets
      insertAtCursor(snippet, nextAssets)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  // RENDERING ENGINE
  useEffect(() => {
    const updatePreview = () => {
      if (!previewRef.current) return
      setCompiling(true)
      setError(null)

      try {
        let text = content
        text = text.replace(/^%.*$/gm, '')

        const mathBlocks: string[] = []
        text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
          const id = `__MATH_STUB_${mathBlocks.length}__`
          mathBlocks.push(katex.renderToString(math, { displayMode: true, throwOnError: false }))
          return id
        })
        text = text.replace(/\$([\s\S]*?)\$/g, (_, math) => {
          const id = `__MATH_STUB_${mathBlocks.length}__`
          mathBlocks.push(katex.renderToString(math, { displayMode: false, throwOnError: false }))
          return id
        })

        const componentBlocks: string[] = []
        text = text.replace(/\\begin\{(table|figure)\}(?:\[.*?\])?([\s\S]*?)\\end\{\1\}/g, (_, type, inner) => {
          const id = `__COMP_STUB_${componentBlocks.length}__`
          const captionMatch = inner.match(/\\caption\{(.*?)\}/)
          const caption = captionMatch ? captionMatch[1] : ''
          const isFigure = type === 'figure'

          let innerHtml = ''
          if (isFigure) {
            const imgMatch = inner.match(/\\includegraphics(?:\[.*?\])?\{(.*?)\}/)
            innerHtml = imgMatch ? renderImage(imgMatch[1]) : renderImage('image')
          } else {
            const tabMatch = inner.match(/\\begin\{tabular\}\{(.*?)\}([\s\S]*?)\\end\{tabular\}/)
            innerHtml = tabMatch ? renderTable(tabMatch[2]) : '<div class="text-red-400">Missing Tabular</div>'
          }

          componentBlocks.push(`
            <div class="${type}-container my-10 flex flex-col items-center">
              ${!isFigure && caption ? `<div class="mb-4 text-[13px] text-gray-700 font-sans"><span class="font-bold mr-2 uppercase tracking-tighter">Table 1:</span>${caption}</div>` : ''}
              ${innerHtml}
              ${isFigure && caption ? `<div class="mt-4 text-[13px] italic text-gray-500 font-serif text-center px-4"><span class="font-bold not-italic font-sans mr-2">Figure 1:</span>${caption}</div>` : ''}
            </div>
          `)
          return id
        })

        text = text.replace(/\\begin\{tabular\}\{(.*?)\}([\s\S]*?)\\end\{tabular\}/g, (_, __, inner) => {
          const id = `__COMP_STUB_${componentBlocks.length}__`
          componentBlocks.push(`<div class="my-6">${renderTable(inner)}</div>`)
          return id
        })

        text = text.replace(/\\includegraphics(?:\[.*?\])?\{(.*?)\}/g, (_, filename) => {
          const id = `__COMP_STUB_${componentBlocks.length}__`
          componentBlocks.push(`<div class="my-6 flex justify-center">${renderImage(filename)}</div>`)
          return id
        })

        let html = text
          .replace(/\\section\{(.*?)\}/g, '<h1>$1</h1>')
          .replace(/\\subsection\{(.*?)\}/g, '<h2>$1</h2>')
          .replace(/\\subsubsection\{(.*?)\}/g, '<h3>$1</h3>')
          .replace(/\\textbf\{(.*?)\}/g, '<strong>$1</strong>')
          .replace(/\\textit\{(.*?)\}/g, '<em>$1</em>')

        html = html.replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, (_, inner) => {
          const items = inner.split('\\item').filter(Boolean).map((item: string) => `<li>${item.trim()}</li>`).join('')
          return `<ul class="list-disc pl-8 my-6 space-y-2 font-serif">${items}</ul>`
        })

        html = html.split('\n\n').map(p => {
          const trimmed = p.trim()
          if (!trimmed) return ''
          if (trimmed.startsWith('__MATH_') || trimmed.startsWith('__COMP_') || trimmed.startsWith('<h')) return trimmed
          return `<p>${trimmed}</p>`
        }).join('')

        componentBlocks.forEach((rendered, i) => html = html.replace(`__COMP_STUB_${i}__`, rendered))
        mathBlocks.forEach((rendered, i) => html = html.replace(`__MATH_STUB_${i}__`, rendered))

        if (previewRef.current) previewRef.current.innerHTML = html
        setCompiling(false)
      } catch (err: any) {
        console.warn("LaTeX Engine Error:", err)
        setError(err.message || "Rendering Error")
        setCompiling(false)
      }
    }

    const timer = setTimeout(updatePreview, 300)
    return () => clearTimeout(timer)
  }, [content, localAssets])

  // CHECK EXPORT SERVICE STATUS
  useEffect(() => {
    const checkService = async () => {
      try {
        const res = await fetch('/api/export/health').catch(() => ({ ok: false }))
        setIsServiceOnline(res.ok || false)
      } catch {
        setIsServiceOnline(false)
      }
    }
    checkService()
    const interval = setInterval(checkService, 10000)
    return () => clearInterval(interval)
  }, [])

  function renderTable(inner: string) {
    const cleanContent = inner.replace(/\\(hline|toprule|midrule|bottomrule|rowcolor\{.*?\})/g, '').trim()
    const rows = cleanContent.split('\\\\').map(row => row.trim()).filter(Boolean).map(row => {
      const cells = row.split('&').map(cell => `<td class="border border-gray-200 px-6 py-3">${cell.trim()}</td>`).join('')
      return `<tr class="border-b border-gray-100 last:border-0">${cells}</tr>`
    }).join('')
    return `<table class="w-full border-collapse border border-gray-200 text-sm font-sans my-4 shadow-sm rounded-sm overflow-hidden">${rows}</table>`
  }

  function renderImage(filename: string) {
    let src = filename
    if (filename.startsWith('asset:')) {
      const assetName = filename.replace('asset:', '')
      const asset = localAssets.find(a => a.name === assetName)
      if (asset) src = asset.data
    }
    const isBase64 = src.startsWith('data:image')
    const isUrl = src.startsWith('http')
    
    if (isBase64 || isUrl) {
      return `<img src="${src}" alt="${filename}" class="max-w-full h-auto rounded-lg shadow-md border border-gray-100 max-h-[5in] object-contain" />`
    }
    return `<div class="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 w-full max-w-md h-48 flex flex-col items-center justify-center text-gray-400 group hover:border-blue-200 transition-colors">
        <div class="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 text-blue-500/50">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        </div>
        <span class="text-[10px] font-bold tracking-widest uppercase text-center truncate px-4 w-full">Missing: ${filename}</span>
      </div>`
  }

  const isDark = theme === 'dark'
  const bgMain = isDark ? 'bg-[#0d1117]' : 'bg-[#f6f8fa]'
  const bgSide = isDark ? 'bg-[#161b22]' : 'bg-white'
  const bgPreview = isDark ? 'bg-[#0a0c10]' : 'bg-[#e5e7eb]'
  const textColor = isDark ? 'text-gray-300' : 'text-gray-800'
  const borderColor = isDark ? 'border-white/5' : 'border-gray-200'

  return (
    <div className={`flex-1 flex flex-col h-full ${bgMain} overflow-hidden font-sans transition-colors duration-300`}>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
      
      <div className={`h-10 px-4 ${bgSide} border-b ${borderColor} flex items-center justify-between text-[11px] font-medium transition-colors`}>
        <div className="flex items-center space-x-4">
          <button onClick={toggleSidebar} className={`p-1.5 rounded hover:bg-black/5 transition-colors ${sidebarOpen ? 'text-blue-500' : 'text-gray-400'}`}>
            <SidebarIcon size={14} />
          </button>
          <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-blue-500/10 text-blue-500">
            <Sparkles size={12} />
            <span className="font-bold tracking-tight uppercase tracking-tighter">LaTeX Ultimate</span>
          </div>
          <div className={`flex items-center space-x-2 border-l ${borderColor} pl-4`}>
            {compiling ? (
               <span className="flex items-center space-x-1 text-amber-500 animate-pulse">
                 <Loader2 size={10} className="animate-spin" />
                 <span>Syncing...</span>
               </span>
            ) : error ? (
               <span className="flex items-center space-x-1 text-red-500">
                 <AlertCircle size={10} />
                 <span>Parse Error</span>
               </span>
            ) : (
               <span className="flex items-center space-x-1 text-emerald-500">
                 <CheckCircle2 size={10} />
                 <span>Ready</span>
               </span>
            )}
          </div>
          {!isServiceOnline && (
            <div className="flex items-center space-x-2 border-l border-red-500/20 pl-4">
              <span className="flex items-center space-x-1 text-red-400 bg-red-400/10 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter animate-pulse">
                <AlertCircle size={10} />
                <span>Export Service Offline</span>
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4 text-gray-400">
          <button onClick={toggleTheme} className="p-1.5 hover:text-blue-500 transition-colors">
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <span className={`${isDark ? 'bg-white/5' : 'bg-black/5'} px-2 py-0.5 rounded italic`}>{content.split(/\s+/).filter(Boolean).length} words</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {sidebarOpen && (
          <div className={`${bgSide} border-r ${borderColor} w-60 flex flex-col shrink-0 transition-all duration-300`}>
            <div className="flex-1 flex flex-col min-h-0">
                <div className={`p-3 flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b ${borderColor}`}>
                    <ListTree size={14} />
                    <span>Outline</span>
                </div>
                <div className="flex-1 overflow-auto p-1 py-4 space-y-0.5 custom-scrollbar">
                    {outline.map((item) => (
                        <button key={item.id} className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all hover:bg-black/5 text-gray-500 hover:text-blue-500 truncate ${item.level === 2 ? 'pl-6 opacity-80' : item.level === 3 ? 'pl-9 opacity-60' : 'font-semibold'}`}>
                            {item.title}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 border-t border-gray-100/10">
                <div className={`p-3 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b ${borderColor}`}>
                    <div className="flex items-center space-x-2">
                        <ImageIcon size={14} />
                        <span>Assets</span>
                    </div>
                    <span className="bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded text-[9px]">{localAssets.length}</span>
                </div>
                <div className="flex-1 overflow-auto p-3 space-y-3 custom-scrollbar">
                    {localAssets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-300 italic text-[10px] space-y-2 opacity-50">
                            <FileCode size={20} />
                            <span>No images uploaded</span>
                        </div>
                    ) : (
                        localAssets.map((asset, i) => (
                            <div key={i} className={`group relative p-2 rounded-lg border ${borderColor} hover:bg-blue-500/5 hover:border-blue-500/30 transition-all`}>
                                <div className="aspect-video rounded bg-gray-50 overflow-hidden mb-2 relative border border-gray-100">
                                    <img src={asset.data} alt={asset.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <button onClick={() => insertAtCursor(`\\includegraphics{asset:${asset.name}}`)} className="bg-white text-black p-1.5 rounded-full shadow-lg transform hover:scale-110">
                                            <FileCode size={12} />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-[10px] font-bold text-gray-500 truncate pr-4">{asset.name}</div>
                                <div className="text-[9px] text-gray-400 font-mono opacity-60">asset:{asset.name}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleEditorChange}
              spellCheck={false}
              className={`flex-1 bg-transparent p-10 text-[15px] font-mono leading-relaxed ${textColor} focus:outline-none resize-none custom-scrollbar placeholder-gray-400 border-none transition-colors selection:bg-blue-500/20`}
              placeholder="Start typing LaTeX..."
            />
          </div>
          
          <div className={`w-[1px] ${borderColor} shrink-0`} />

          <div 
            ref={previewContainerRef}
            className={`flex-[1.3] overflow-auto ${bgPreview} p-12 custom-scrollbar scroll-smooth transition-colors flex justify-center items-start`}
          >
            <div 
              className="relative transition-transform duration-300 origin-top shadow-[0_40px_100px_rgba(0,0,0,0.1)]"
              style={{ transform: `scale(${scale})` }}
            >
              <div 
                id="latex-paper-sheet"
                className={`bg-white w-[8.27in] max-w-none min-h-[11.69in] rounded-sm p-[1in] prose prose-slate relative transition-all duration-500`}
              >
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />
                  <div ref={previewRef} className="latex-content text-gray-900 leading-[1.8] relative z-10" />
              </div>
              <div className="absolute top-4 right-4 z-20">
                <button onClick={() => setContent(content)} title="Force Re-render" className="p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-blue-500 transition-all hover:scale-110 shadow-lg border border-gray-100">
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* @ts-ignore */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}; }
        
        .latex-content h1 { font-family: 'Inter', sans-serif; font-weight: 800; border-bottom: 2px solid #f0f0f0; padding-bottom: 0.5rem; margin-bottom: 1.5rem; color: #000; font-size: 2.22rem; line-height: 1.2; }
        .latex-content h2 { font-family: 'Inter', sans-serif; font-weight: 700; color: #111; margin-top: 2rem; font-size: 1.5rem; border-left: 4px solid #3b82f6; padding-left: 1rem; }
        .latex-content p { font-family: 'Georgia', serif; font-size: 1.05rem; line-height: 1.8; color: #2e2e2e; margin-bottom: 1.2rem; text-align: justify; }
        .latex-content ul li { font-family: 'Georgia', serif; font-size: 1.05rem; list-style-type: disc; margin-bottom: 0.6rem; color: #444; }
        .latex-content strong { color: #000; font-weight: 700; }
        
        .katex-display { margin: 2rem 0 !important; padding: 1.5rem !important; background: #fcfcfc !important; border: 1px solid #f0f0f0 !important; border-radius: 8px !important; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02) !important; overflow-x: auto !important; }
        .katex { font-size: 1.15em !important; }
        
        .table-container td { font-size: 0.95rem; color: #333; }
      `}</style>
    </div>
  )
}
