"use client";

// @ts-ignore
import { useState, useCallback, useMemo, useEffect } from "react";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { EditorProps } from "@opensuite/plugin-api";

export default function MarkdownEditor({ document: doc, onChange, onStatsUpdate }: EditorProps) {
  const [content, setContent] = useState<string>(
    (doc.blocks[0]?.content as unknown as string) || "# Welcome to Markdown\n\nStart typing here..."
  );
  
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEditorChange = useCallback((value: string) => {
    setContent(value);
    setIsUpdating(true);
    
    // Update document sync
    onChange({
      ...doc,
      blocks: [
        {
          id: "main",
          type: "markdown" as any,
          props: {},
          content: [],
          children: [],
          ...({ content: value } as any),
        },
      ],
      updatedAt: new Date().toISOString(),
    });

    if (onStatsUpdate) {
      onStatsUpdate({
        words: value.split(/\s+/).filter(Boolean).length,
        chars: value.length,
      });
    }
    
    // Reset updating flag after a tiny delay for the animation
    setTimeout(() => setIsUpdating(false), 100);
  }, [doc, onChange, onStatsUpdate]);

  const editorOptions = useMemo(() => ({
    spellChecker: false,
    autofocus: true,
    placeholder: "Type your markdown here...",
    status: ["lines", "words", "cursor"],
    renderingConfig: {
      singleLineBreaks: false,
    },
    minHeight: "calc(100vh - 180px)",
    shortcuts: {
      "toggleOrderedList": "Cmd-Alt-L",
      "toggleCodeBlock": "Cmd-Alt-C"
    }
  }), []);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-white dark:bg-[#0a0c10] font-sans">
      {/* Editor Pane */}
      <div className="flex-1 border-r border-gray-200 dark:border-white/5 overflow-auto p-4 custom-mde transition-colors duration-300">
        <SimpleMDE
          value={content}
          onChange={handleEditorChange}
          options={editorOptions}
        />
      </div>

      {/* Preview Pane */}
      <div className="flex-1 overflow-auto bg-[#f8fafc] dark:bg-[#0d1117] p-8 md:p-12 custom-scrollbar">
        <div 
          className={`max-w-prose mx-auto bg-white dark:bg-[#161b22] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-200/50 dark:border-white/5 rounded-xl p-10 md:p-16 min-h-[11in] transition-all duration-300 ${isUpdating ? 'opacity-80 scale-[0.99]' : 'opacity-100 scale-100'}`}
        >
          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h1:border-b prose-h1:pb-4 prose-h1:mb-8 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:border prose-pre:border-white/10 prose-img:rounded-xl prose-img:shadow-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* @ts-ignore */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }

        .custom-mde .editor-toolbar {
          border: none;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          background: transparent;
          opacity: 0.7;
          transition: opacity 0.2s;
          padding: 0 0 10px 0;
        }
        .custom-mde .editor-toolbar:hover { opacity: 1; }
        
        .dark .custom-mde .editor-toolbar { border-bottom-color: rgba(255,255,255,0.05); }
        .dark .custom-mde .editor-toolbar a { color: #8b949e !important; }
        .dark .custom-mde .editor-toolbar a:hover, 
        .dark .custom-mde .editor-toolbar a.active { background: #21262d; border-color: #30363d; color: #58a6ff !important; }
        .dark .custom-mde .editor-toolbar i.separator { border-left-color: #30363d; border-right-color: #30363d; }

        .custom-mde .CodeMirror {
          border: none;
          background: transparent;
          font-family: 'ui-monospace', 'SFMono-Regular', 'SF Mono', 'Menlo', 'Consolas', 'Liberation Mono', monospace;
          font-size: 15px;
          line-height: 1.6;
          color: #1f2328;
        }
        .dark .custom-mde .CodeMirror { color: #e6edf3; }
        .custom-mde .CodeMirror-scroll { min-height: calc(100vh - 200px); }
        
        .custom-mde .editor-statusbar { color: #8b949e; font-size: 11px; padding: 10px 0; }
      `}</style>
    </div>
  );
}
