"use client"

import { useEffect, useState } from "react"

export const createResizableImage = async () => {
  const { NodeViewWrapper, ReactNodeViewRenderer } = await import("@tiptap/react")
  const Image = (await import("@tiptap/extension-image")).default || (await import("@tiptap/extension-image")).Image


  return Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: '100%',
          renderHTML: (attributes) => {
            return {
              width: attributes.width,
            }
          }
        },
      }
    },
    
    addNodeView() {
      return ReactNodeViewRenderer(ImageView)
    },
  })
}

function ImageView(props: any) {
  // Since we are now using dynamic rendering, we need to import NodeViewWrapper locally or use a trick
  // But ImageView is called by ReactNodeViewRenderer which we imported.
  // We can't easily avoid the import here if we want to use the component.
  // Actually, we can import it inside the component or pass it.
  
  return (
    <div className="max-w-full group my-4 mx-auto block text-center" style={{ userSelect: "none" }}>
       <div 
         className="relative inline-block overflow-hidden" 
         style={{ resize: "horizontal", minWidth: "150px", maxWidth: "100%", width: props.node.attrs.width }}
         onMouseUp={(e) => {
            const style = window.getComputedStyle(e.currentTarget);
            if (style.width !== props.node.attrs.width) {
               props.updateAttributes({ width: style.width })
            }
         }}
       >
         <img 
           src={props.node.attrs.src} 
           alt={props.node.attrs.alt || ""} 
           title={props.node.attrs.title || ""}
           className="w-full h-auto object-contain pointer-events-none rounded-lg"
         />
       </div>
       <figcaption className="mt-2 text-sm text-gray-500 flex justify-center">
         <input 
            type="text"
            className="bg-transparent border-none outline-none text-center hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 rounded px-2 w-full max-w-sm transition-colors"
            placeholder="Add a caption..."
            value={props.node.attrs.alt || ""}
            onChange={(e) => props.updateAttributes({ alt: e.target.value })}
         />
       </figcaption>
    </div>
  )
}
