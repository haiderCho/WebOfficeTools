import type { JSONContent } from "@tiptap/react"
import type { Block, InlineContent, Mark } from "@opensuite/core"
import { createBlock } from "@opensuite/core"

/**
 * Converts TipTap JSON content to OpenSuite Block model.
 */
export function tiptapToBlocks(json: JSONContent): Block[] {
  return (json.content ?? []).map(nodeToBlock)
}

/**
 * Converts OpenSuite Block model to TipTap JSON content.
 */
export function blocksToTiptap(blocks: Block[]): JSONContent {
  return {
    type: "doc",
    content: blocks.map(blockToNode),
  }
}

function nodeToBlock(node: JSONContent): Block {
  switch (node.type) {
    case "heading":
      return createBlock("heading", {
        props: { level: node.attrs?.level ?? 1 },
        content: inlineContent(node.content),
      })
    case "paragraph":
      return createBlock("paragraph", {
        content: inlineContent(node.content),
      })
    case "bulletList":
      return createBlock("container", {
        props: { variant: "bullet-list" },
        children: (node.content ?? []).map(nodeToBlock),
      })
    case "orderedList":
      return createBlock("container", {
        props: { variant: "ordered-list" },
        children: (node.content ?? []).map(nodeToBlock),
      })
    case "taskList":
      return createBlock("container", {
        props: { variant: "task-list" },
        children: (node.content ?? []).map(nodeToBlock),
      })
    case "listItem":
      return createBlock("list-item", {
        content: inlineContent(node.content),
      })
    case "taskItem":
      return createBlock("list-item", {
        props: { checked: !!node.attrs?.checked },
        content: inlineContent(node.content),
      })
    case "table":
        return createBlock("container", {
            props: { variant: "table" },
            children: (node.content ?? []).map(nodeToBlock),
        })
    case "tableRow":
        return createBlock("container", {
            props: { variant: "table-row" },
            children: (node.content ?? []).map(nodeToBlock),
        })
    case "tableCell":
        return createBlock("container", {
            props: { variant: "table-cell" },
            children: (node.content ?? []).map(nodeToBlock),
        })
    case "image":
        return createBlock("image", {
            props: { src: node.attrs?.src },
        })
    case "math":
        return createBlock("math", {
            props: { tex: node.attrs?.tex },
        })
    case "codeBlock":
        return createBlock("code", {
            props: { language: node.attrs?.language },
            content: [{ text: node.content?.[0]?.text ?? "", marks: [] }]
        })
    case "horizontalRule":
      return createBlock("divider", {})
    case "blockquote":
      return createBlock("blockquote", {
        content: inlineContent(node.content),
      })
    default:
      return createBlock("paragraph", { 
        content: inlineContent(node.content) 
      })
  }
}

function blockToNode(block: Block): JSONContent {
  switch (block.type) {
    case "heading":
      return {
        type: "heading",
        attrs: { level: (block.props as { level?: number })?.level ?? 1 },
        content: blocksToInline(block.content ?? []),
      }
    case "paragraph":
      return {
        type: "paragraph",
        content: blocksToInline(block.content ?? []),
      }
    case "divider":
      return { type: "horizontalRule" }
    case "blockquote":
      return {
        type: "blockquote",
        content: blocksToInline(block.content ?? []),
      }
    case "container":
        const variant = (block.props as { variant?: string })?.variant;
        if (variant === "bullet-list") return { type: "bulletList", content: (block.children ?? []).map(blockToNode) };
        if (variant === "ordered-list") return { type: "orderedList", content: (block.children ?? []).map(blockToNode) };
        if (variant === "task-list") return { type: "taskList", content: (block.children ?? []).map(blockToNode) };
        if (variant === "table") return { type: "table", content: (block.children ?? []).map(blockToNode) };
        if (variant === "table-row") return { type: "tableRow", content: (block.children ?? []).map(blockToNode) };
        if (variant === "table-cell") return { type: "tableCell", content: (block.children ?? []).map(blockToNode) };
        return { type: "paragraph", content: blocksToInline(block.content ?? []) };
    case "list-item":
      const isTask = (block.props as { checked?: boolean })?.checked !== undefined;
      return {
        type: isTask ? "taskItem" : "listItem",
        attrs: isTask ? { checked: !!(block.props as any).checked } : {},
        content: [
           { 
             type: "paragraph", 
             content: blocksToInline(block.content ?? []) 
           }
        ]
      }
    case "image":
        return { type: "image", attrs: { src: (block.props as { src?: string })?.src } };
    case "math":
        return { type: "math", attrs: { tex: (block.props as { tex?: string })?.tex } };
    case "code":
        return { 
            type: "codeBlock", 
            attrs: { language: (block.props as { language?: string })?.language },
            content: [{ type: "text", text: block.content?.[0]?.text ?? "" }]
        };
    default:
      return {
        type: "paragraph",
        content: blocksToInline(block.content ?? []),
      }
  }
}

function inlineContent(nodes: JSONContent[] = []): InlineContent[] {
  return (nodes || []).map((n) => ({
    text: n.text ?? "",
    marks: (n.marks ?? []).map((m) => ({
      type: m.type as Mark,
      props: m.attrs || {},
    })),
  }))
}

function blocksToInline(content: InlineContent[]): JSONContent[] {
  return (content || []).map((c) => ({
    type: "text",
    text: c.text,
    marks: (c.marks ?? []).map((m) => {
      if (typeof m === 'string') return { type: m };
      return { 
        type: m.type, 
        attrs: m.props 
      };
    }),
  }))
}
