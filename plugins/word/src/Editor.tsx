import "katex/dist/katex.min.css"
import { Bold, Italic, Strikethrough, Code } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import type { EditorProps } from "@opensuite/plugin-api"
import { tiptapToBlocks, blocksToTiptap } from "./bridge"
import { useWordStore } from "./store"
import { createSlashCommand } from "./slashCommand"
import { createResizableImage } from "./ResizableImage"


export default function WordEditor({ document, onChange, onStatsUpdate }: EditorProps) {


  const { setEditor: setStoreEditor, zoom } = useWordStore()

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





        
        const lowlightInstance = createLowlight(all)
        
        const instance = new Editor({
          extensions: [
            StarterKit.configure({
              codeBlock: false,
            }),
            CodeBlockLowlight.configure({
              lowlight: lowlightInstance,
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
            TextStyle,
            FontFamily,
            FontSize,
            LineHeight.configure({
              defaultLineHeight: "1.0",
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
              })
            }
          },

          editorProps: {
            attributes: {
              class: "prose prose-sm mx-auto focus:outline-none min-h-[297mm] w-[210mm] p-[25mm] bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 my-8 print:m-0 print:shadow-none print:w-full",
              style: "font-size: 12pt; line-height: 1.0;",
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

  if (!editor || !tiptap) {
    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-8 min-h-screen animate-pulse" />
    )
  }

  const { EditorContent, BubbleMenu } = tiptap

  return (
    <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-8 min-h-screen overflow-auto flex flex-col items-center">
      <div 
        className="transition-transform duration-200 ease-out origin-top"
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

