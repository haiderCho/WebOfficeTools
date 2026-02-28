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
    case "listItem":
      return createBlock("list-item", {
        content: inlineContent(node.content),
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
    // Lists are mapped to containers in our model for now
    case "list-item":
      return {
        type: "listItem",
        content: [
           { 
             type: "paragraph", 
             content: blocksToInline(block.content ?? []) 
           }
        ]
      }
    default:
      return {
        type: "paragraph",
        content: blocksToInline(block.content ?? []),
      }
  }
}

function inlineContent(nodes: JSONContent[] = []): InlineContent[] {
  return nodes.map((n) => ({
    text: n.text ?? "",
    marks: (n.marks ?? []).map((m) => m.type as Mark),
    // Simplified: TipTap attrs are complex, focusing on basics for Phase 1
  }))
}

function blocksToInline(content: InlineContent[]): JSONContent[] {
  return content.map((c) => ({
    type: "text",
    text: c.text,
    marks: (c.marks ?? []).map((m) => ({ type: m })),
  }))
}
