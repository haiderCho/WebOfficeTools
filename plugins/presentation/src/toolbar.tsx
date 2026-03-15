"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import type { ToolbarProps } from "@opensuite/plugin-api"
import { Button } from "@opensuite/ui"
import {
  Play, PlusSquare, Type, Image as ImageIcon, Square, Circle,
  Minus, Paintbrush, LayoutTemplate, Presentation, Maximize,
  Table, StickyNote, Undo2, Redo2,
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
  AlignRight, List, ListOrdered, Subscript, Superscript,
  Download, FileText
} from "lucide-react"

function emit(action: string, payload?: any) {
  window.dispatchEvent(new CustomEvent("pres-action", { detail: { action, payload } }))
}

export default function PresentationToolbar({ document: doc, onChange }: ToolbarProps) {
  const slides: any[] = (doc as any).slides || []

  const addSlide = () => {
    onChange({
      ...doc,
      slides: [...slides, { id: crypto.randomUUID(), layout: "content", title: "", body: "", elements: [] }],
    } as any)
  }

  return (
    <div style={{
      height: 44, borderBottom: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(16px)", display: "flex", alignItems: "center", padding: "0 12px", gap: 2, userSelect: "none",
    }}>
      {/* Present */}
      <Group border>
        <Button variant="primary" size="sm" onClick={() => emit("present")}
          className="flex items-center gap-1.5 !px-3 !py-1 !text-[11px] !rounded-md shadow-sm">
          <Play size={11} fill="currentColor" /> Present
        </Button>
        <Btn icon={Maximize} tip="Fullscreen" onClick={() => emit("present")} />
      </Group>

      {/* Slide */}
      <Group>
        <Btn icon={PlusSquare} tip="New Slide" onClick={addSlide} />
        <Btn icon={LayoutTemplate} tip="Cycle Layout" onClick={() => emit("cycle-layout")} />
      </Group>
      <Sep />

      {/* Insert */}
      <Group>
        <Btn icon={Type} tip="Text Box" onClick={() => emit("insert", "text")} />
        <Btn icon={ImageIcon} tip="Image" onClick={() => emit("insert", "image")} />
        <Btn icon={Square} tip="Rectangle" onClick={() => emit("insert", "rectangle")} />
        <Btn icon={Circle} tip="Ellipse" onClick={() => emit("insert", "ellipse")} />
        <Btn icon={Minus} tip="Line" onClick={() => emit("insert", "line")} />
        <Btn icon={Table} tip="Table" onClick={() => emit("insert", "table")} />
        <Btn icon={StickyNote} tip="Note" onClick={() => emit("insert", "note")} />
      </Group>
      <Sep />

      {/* Design */}
      <Group>
        <Btn icon={Paintbrush} tip="Cycle Theme" onClick={() => emit("cycle-theme")} />
      </Group>
      <Sep />

      {/* Text Format */}
      <Group>
        <Btn icon={Bold} tip="Bold" onClick={() => emit("format", "bold")} />
        <Btn icon={Italic} tip="Italic" onClick={() => emit("format", "italic")} />
        <Btn icon={Underline} tip="Underline" onClick={() => emit("format", "underline")} />
        <Btn icon={Strikethrough} tip="Strikethrough" onClick={() => emit("format", "strikeThrough")} />
      </Group>
      <Sep />

      {/* Paragraph & List */}
      <Group>
        <Btn icon={AlignLeft} tip="Align Left" onClick={() => emit("format", "justifyLeft")} />
        <Btn icon={AlignCenter} tip="Align Center" onClick={() => emit("format", "justifyCenter")} />
        <Btn icon={AlignRight} tip="Align Right" onClick={() => emit("format", "justifyRight")} />
        <Btn icon={List} tip="Bulleted List" onClick={() => emit("format", "insertUnorderedList")} />
        <Btn icon={ListOrdered} tip="Numbered List" onClick={() => emit("format", "insertOrderedList")} />
        <Btn icon={Subscript} tip="Subscript" onClick={() => emit("format", "subscript")} />
        <Btn icon={Superscript} tip="Superscript" onClick={() => emit("format", "superscript")} />
      </Group>
      <Sep />

      {/* Undo / Redo */}
      <Group>
        <Btn icon={Undo2} tip="Undo" onClick={() => emit("undo")} />
        <Btn icon={Redo2} tip="Redo" onClick={() => emit("redo")} />
      </Group>
      <Sep />

      {/* Export */}
      <Group>
        <Btn icon={Presentation} tip="Export to PPTX" onClick={() => emit("export-pptx")} />
        <Btn icon={FileText} tip="Export to PDF" onClick={() => emit("export-pdf")} />
      </Group>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 9, color: "#9ca3af", textTransform: "uppercase", fontWeight: 700, letterSpacing: 2, display: "flex", alignItems: "center", gap: 6 }}>
          <Presentation size={10} style={{ color: "#3b82f6" }} /> Presentation
        </span>
      </div>
    </div>
  )
}

/* ─── Sub-components ─── */

function Btn({ icon: Icon, tip, onClick }: { icon: any; tip: string; onClick?: () => void }) {
  return (
    <button onClick={() => {
        if (tip.includes("Export")) {
          // Force active element to blur and dump its text to state
          if (document.activeElement instanceof HTMLElement) {
             document.activeElement.blur()
          }
          // Delay event slightly to allow React to update Editor's `doc` with the blurred data
          setTimeout(() => onClick?.(), 150)
        } else {
          onClick?.()
        }
      }} 
      title={tip} style={{
      padding: 6, borderRadius: 6, color: "#6b7280", border: "none", background: "none", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#374151" }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#6b7280" }}
      onMouseDown={(e) => {
        // Prevent stealing focus from contentEditable elements when formatting
        if (!tip.includes("Export")) {
          e.preventDefault()
        }
      }}
    >
      <Icon size={15} />
    </button>
  )
}

function Group({ children, border }: { children: React.ReactNode; border?: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 1,
      ...(border ? { borderRight: "1px solid rgba(0,0,0,0.08)", paddingRight: 8, marginRight: 4 } : {}),
    }}>
      {children}
    </div>
  )
}

function Sep() {
  return <div style={{ width: 1, height: 20, background: "rgba(0,0,0,0.08)", margin: "0 4px" }} />
}
