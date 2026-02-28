import type { Editor, Range } from "@tiptap/core"
import tippy from "tippy.js"
import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { Type, Heading1, Heading2, List, ListOrdered, CheckSquare, Code, Quote, Sigma, Image as ImageIcon } from "lucide-react"


export interface CommandItemProps {
  title: string
  description: string
  icon: React.ReactNode
  command: ({ editor, range }: { editor: Editor; range: Range }) => void
}

export const getSuggestionItems = ({ query }: { query: string }): CommandItemProps[] => {
  return [
    {
      title: "Text",
      description: "Just start typing with plain text.",
      icon: <Type size={18} />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).setNode("paragraph").run()
      },
    },
    {
      title: "Heading 1",
      description: "Big section heading.",
      icon: <Heading1 size={18} />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run()
      },
    },
    {
      title: "Heading 2",
      description: "Medium section heading.",
      icon: <Heading2 size={18} />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run()
      },
    },
    {
      title: "Bullet List",
      description: "Create a simple bulleted list.",
      icon: <List size={18} />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      },
    },
    {
      title: "Numbered List",
      description: "Create a list with numbering.",
      icon: <ListOrdered size={18} />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      },
    },
    {
      title: "Quote",
      description: "Capture a quote.",
      icon: <Quote size={18} />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).setBlockquote().run()
      },
    },
    {
      title: "Code Block",
      description: "Capture a code snippet.",
      icon: <Code size={18} />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).setCodeBlock().run()
      },
    },
    {
      title: "Math Block",
      description: "Write LaTeX formulas.",
      icon: <Sigma size={18} />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).insertContent('<math-display></math-display>').run()
      },
    },
    {
      title: "Image",
      description: "Insert an image from URL.",
      icon: <ImageIcon size={18} />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        const url = window.prompt("Enter image URL")
        if (url) {
          editor.chain().focus().deleteRange(range).setImage({ src: url }).run()
        }
      },
    },
  ].filter((item) => item.title.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10)
}

export const CommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    setSelectedIndex(0)
  }, [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === "ArrowUp") {
        event.preventDefault()
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
        return true
      }

      if (event.key === "ArrowDown") {
        event.preventDefault()
        setSelectedIndex((selectedIndex + 1) % props.items.length)
        return true
      }

      if (event.key === "Enter") {
        event.preventDefault()
        selectItem(selectedIndex)
        return true
      }

      return false
    },
  }))

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  if (!props.items.length) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden py-2 w-64">
      {props.items.map((item: CommandItemProps, index: number) => (
        <button
          key={index}
          className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
            index === selectedIndex
              ? "bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
          onClick={() => selectItem(index)}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shrink-0 shadow-sm text-inherit">
            {item.icon}
          </div>
          <div>
            <p className="font-medium">{item.title}</p>
            <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
          </div>
        </button>
      ))}
    </div>
  )
})

CommandList.displayName = "CommandList"

export const renderItems = () => {
  let component: any = null
  let popup: typeof tippy | null = null

  return {
    onStart: async (props: any) => {
      const { ReactRenderer } = await import("@tiptap/react")
      component = new ReactRenderer(CommandList, {
        props,
        editor: props.editor,
      })


      if (!props.clientRect) {
        return
      }

      // @ts-ignore
      popup = tippy("body", {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
      })
    },

    onUpdate(props: any) {
      component?.updateProps(props)

      if (!props.clientRect) {
        return
      }

      // @ts-ignore
      popup?.[0].setProps({
        getReferenceClientRect: props.clientRect,
      })
    },

    onKeyDown(props: any) {
      if (props.event.key === "Escape") {
        // @ts-ignore
        popup?.[0].hide()
        return true
      }
      // @ts-ignore
      return component?.ref?.onKeyDown(props)
    },

    onExit() {
      // @ts-ignore
      popup?.[0].destroy()
      component?.destroy()
    },
  }
}
