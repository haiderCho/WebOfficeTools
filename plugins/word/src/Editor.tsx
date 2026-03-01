import { SmartPagination } from "./SmartPagination"
import "katex/dist/katex.min.css"
import "./editor.css"
import { Bold, Italic, Strikethrough, Code } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import type { EditorProps } from "@opensuite/plugin-api"
import { tiptapToBlocks, blocksToTiptap } from "./bridge"
import { useWordStore } from "./store"
import { createSlashCommand } from "./slashCommand"
import { createResizableImage } from "./ResizableImage"
import { PageBreak } from "./PageBreak"


export default function WordEditor({ document, onChange, onStatsUpdate }: EditorProps) {


  const { setEditor: setStoreEditor, zoom, pageSize, margin, readMode } = useWordStore()

  const [editor, setEditor] = useState<any | null>(null)
  const [tiptap, setTiptap] = useState<{
    EditorContent: any,
    BubbleMenu: any
  } | null>(null)
  
  const initializing = useRef(false)

  useEffect(() => {
    if (initializing.current || editor) return
    initializing.current = true

    const initEditor = async () => {
      try {
        // Dynamic imports for ALL Tiptap modules
        const { Editor, EditorContent } = await import("@tiptap/react")
        const { BubbleMenu } = await import("@tiptap/react/menus")
        
        const StarterKit = (await import("@tiptap/starter-kit")).default || (await import("@tiptap/starter-kit")).StarterKit
        const { CodeBlockLowlight } = await import("@tiptap/extension-code-block-lowlight")
        
        const { all, createLowlight } = await import("lowlight")
        const MathExtension = (await import("tiptap-math")).default
        const { Placeholder } = await import("@tiptap/extension-placeholder")
        const { CharacterCount } = await import("@tiptap/extension-character-count")
        const { TextStyle } = await import("@tiptap/extension-text-style")
        const { FontFamily } = await import("@tiptap/extension-font-family")
        const { FontSize, LineHeight } = await import("./typography")

        const { Underline } = await import("@tiptap/extension-underline")
        const { TextAlign } = await import("@tiptap/extension-text-align")
        const { Color } = await import("@tiptap/extension-color")
        const { Highlight } = await import("@tiptap/extension-highlight")
        const { Subscript } = await import("@tiptap/extension-subscript")
        const { Superscript } = await import("@tiptap/extension-superscript")
        const { TaskList } = await import("@tiptap/extension-task-list")
        const { TaskItem } = await import("@tiptap/extension-task-item")
        const { Table } = await import("@tiptap/extension-table")
        const { TableRow } = await import("@tiptap/extension-table-row")
        const { TableHeader } = await import("@tiptap/extension-table-header")
        const { TableCell } = await import("@tiptap/extension-table-cell")
        const { Link } = await import("@tiptap/extension-link")
        const { SearchAndReplace } = await import("@sereneinserenade/tiptap-search-and-replace")





        
        const lowlightInstance = createLowlight(all)
        
        const instance = new Editor({
          extensions: [
            StarterKit.configure({
              codeBlock: false,
            }),
            CodeBlockLowlight.configure({
              lowlight: lowlightInstance,
            }),
            Underline,
            TextAlign.configure({
              types: ['heading', 'paragraph'],
            }),
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            Subscript,
            Superscript,
            TaskList,
            TaskItem.configure({
              nested: true,
            }),
            Table.configure({
              resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            SearchAndReplace.configure({
              searchResultClass: 'search-result',
            }),
            MathExtension.configure({ 
              evaluation: true 
            }),
            (await createResizableImage()).configure({
              inline: false,
              allowBase64: true,
            }),
            Placeholder.configure({
              placeholder: "Press '/' for commands, or type text...",
            }),
            (await createSlashCommand()).configure({
              suggestion: {
                items: (await import("./SlashMenu")).getSuggestionItems,
                render: (await import("./SlashMenu")).renderItems,
              },
            }),
            CharacterCount.configure(),
            FontFamily,
            FontSize,
            LineHeight.configure({
              defaultLineHeight: "1.0",
            }),
            PageBreak,
            SmartPagination.configure({
              pageHeightMm: pageSize === 'A3' ? 420 : pageSize === 'Letter' ? 279.4 : 297,
            }),
          ],

          content: blocksToTiptap(document.blocks),
          immediatelyRender: false,
          onUpdate: ({ editor }: any) => {
            const json = editor.getJSON()
            const blocks = tiptapToBlocks(json)
            onChange({
              ...document,
              blocks,
            })

            if (onStatsUpdate) {
              onStatsUpdate({
                words: editor.storage.characterCount.words(),
                chars: editor.storage.characterCount.characters(),
                // Count both automatic spacers and manual page-break nodes
                pages: (editor.view.dom as HTMLElement).querySelectorAll('.page-spacer, [data-type="page-break"]').length + 1
              } as any)
            }
          },

          editorProps: {
            attributes: {
              class: `word-editor-content ${pageSize} margin-${margin} prose prose-sm focus:outline-none max-w-none`,
            },
          },


        } as any)

        setTiptap({ EditorContent, BubbleMenu })
        setEditor(instance)
        setStoreEditor(instance)
      } catch (err) {
        console.error("Failed to initialize Tiptap:", err)
      }
    }

    initEditor()

    return () => {
      if (editor) {
        editor.destroy()
      }
      setStoreEditor(null)
    }
  }, [])

  useEffect(() => {
    if (editor) {
      setStoreEditor(editor)
    }
  }, [editor, setStoreEditor])

  useEffect(() => {
    if (editor) {
      const height = pageSize === 'A3' ? 420 : pageSize === 'Letter' ? 279.4 : 297
      editor.setOptions({
        smartPagination: {
           pageHeightMm: height,
           enabled: true
        },
        editorProps: {
          attributes: {
            class: `word-editor-content ${pageSize} margin-${margin} prose prose-sm focus:outline-none max-w-none ${readMode ? 'read-mode' : ''}`,
          }
        }
      })
    }
  }, [editor, pageSize, margin, readMode])
  if (!editor || !tiptap) {
    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-8 min-h-screen animate-pulse" />
    )
  }

  const { EditorContent, BubbleMenu } = tiptap

  return (
    <div className={`flex-1 bg-gray-200 dark:bg-gray-950 p-8 min-h-screen overflow-auto flex flex-col items-center word-workspace-container ${readMode ? 'read-mode-active' : ''}`}>
      <div 
        className="transition-transform duration-200 ease-out origin-top flex flex-col items-center"
        style={{ transform: `scale(${zoom / 100})` }}
      >
        {editor && (
          <BubbleMenu
            editor={editor}
            className="bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded flex overflow-hidden"
          >
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                editor.isActive("bold") ? "bg-gray-100 dark:bg-gray-700 text-blue-600" : "text-gray-600 dark:text-gray-300"
              }`}
            >
               <Bold size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                editor.isActive("italic") ? "bg-gray-100 dark:bg-gray-700 text-blue-600" : "text-gray-600 dark:text-gray-300"
              }`}
            >
               <Italic size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                editor.isActive("strike") ? "bg-gray-100 dark:bg-gray-700 text-blue-600" : "text-gray-600 dark:text-gray-300"
              }`}
            >
               <Strikethrough size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                editor.isActive("code") ? "bg-gray-100 dark:bg-gray-700 text-blue-600" : "text-gray-600 dark:text-gray-300"
              }`}
            >
               <Code size={16} />
            </button>
          </BubbleMenu>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  )

}

