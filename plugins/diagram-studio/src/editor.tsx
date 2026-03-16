"use client"

import React, { useEffect, useState } from "react"
import { Tldraw, createTLStore, defaultShapeUtils } from "tldraw"
import "tldraw/tldraw.css"
import type { EditorProps } from "@opensuite/plugin-api"

export default function DiagramEditor({ document, onChange, theme }: EditorProps) {
  const [store] = useState(() => createTLStore({ shapeUtils: defaultShapeUtils }))
  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  // Load initial state
  useEffect(() => {
    const content = (document as any).content
    if (content?.store && Object.keys(content.store).length > 0) {
      store.loadSnapshot({
        store: content.store,
        schema: content.schema || store.schema.serialize()
      })
    }
  }, [store])

  // Save changes
  const handleMount = (editor: any) => {
    editor.store.listen(() => {
      const snapshot = editor.store.getSnapshot()
      onChange({
        ...document,
        content: {
          schema: snapshot.schema,
          store: snapshot.store,
        }
      } as any)
    }, { source: 'user', scope: 'document' })
  }

  return (
    <div className={`h-full w-full relative ${isDark ? 'tldraw-dark dark' : ''}`}>
      <Tldraw 
        store={store} 
        onMount={handleMount}
        inferDarkMode
      />
    </div>
  )
}
