"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import type { EditorProps } from "@opensuite/plugin-api"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus, Trash2, Layers, ChevronUp, ChevronDown, Copy,
  LayoutTemplate, Palette, Monitor, X, Type, Square, Circle,
  Image as ImageIcon, Minus,
} from "lucide-react"
import type { SlideLayout } from "./types"
import { exportToPptx } from "./export"

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════════ */

const LAYOUTS: { value: SlideLayout; label: string }[] = [
  { value: "title", label: "Title Slide" },
  { value: "content", label: "Title & Content" },
  { value: "blank", label: "Blank" },
  { value: "comparison", label: "Two Column" },
]

const BG = [
  { id: "white", bg: "#ffffff", dark: false },
  { id: "blue", bg: "linear-gradient(135deg,#2563eb,#4338ca)", dark: true },
  { id: "dark", bg: "linear-gradient(135deg,#111827,#1f2937)", dark: true },
  { id: "sunset", bg: "linear-gradient(135deg,#fb923c,#ec4899,#9333ea)", dark: true },
  { id: "emerald", bg: "linear-gradient(135deg,#10b981,#0f766e)", dark: true },
  { id: "slate", bg: "linear-gradient(135deg,#334155,#0f172a)", dark: true },
]

function bgOf(id?: string) { return BG.find((b) => b.id === id) || BG[0]! }

/* ══════════════════════════════════════════════════════════════
   ELEMENT MODEL
   ══════════════════════════════════════════════════════════════ */

interface El {
  id: string
  type: "text" | "rectangle" | "ellipse" | "line" | "image" | "table" | "note"
  x: number; y: number; w: number; h: number
  text?: string
  src?: string
  color?: string
  tableData?: string[][]
}

function makeEl(type: El["type"]): El {
  const id = crypto.randomUUID()
  switch (type) {
    case "text": return { id, type, x: 12, y: 28, w: 45, h: 14, text: "Double-click to edit" }
    case "rectangle": return { id, type, x: 15, y: 25, w: 28, h: 22, color: "#3b82f6" }
    case "ellipse": return { id, type, x: 20, y: 22, w: 20, h: 28, color: "#8b5cf6" }
    case "line": return { id, type, x: 10, y: 50, w: 50, h: 0.5, color: "#6b7280" }
    case "image": return { id, type, x: 12, y: 18, w: 38, h: 32, src: "" }
    case "table": return { id, type, x: 8, y: 18, w: 55, h: 38, tableData: [["Header 1","Header 2","Header 3"],["","",""],["","",""]] }
    case "note": return { id, type, x: 60, y: 8, w: 24, h: 20, text: "Note...", color: "#fef3c7" }
    default: return { id, type: "text", x: 10, y: 25, w: 30, h: 10 }
  }
}

/* ══════════════════════════════════════════════════════════════
   EDITABLE TEXT (for slide layout fields)
   ══════════════════════════════════════════════════════════════ */

function EditableText({ value, placeholder, onChange, style }: {
  value: string; placeholder: string; onChange: (v: string) => void; style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) ref.current.innerText = value || ""
  }, [value])
  return (
    <div ref={ref} contentEditable suppressContentEditableWarning
      onInput={() => ref.current && onChange(ref.current.innerText.trim())}
      onBlur={() => ref.current && onChange(ref.current.innerText.trim())}
      data-ph={placeholder}
      style={{
        outline: "none", padding: "6px 12px", borderRadius: 8, transition: "box-shadow 0.2s",
        minHeight: 28, cursor: "text", ...style,
      }}
      onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px rgba(59,130,246,0.3)" }}
      onBlurCapture={(e) => { e.currentTarget.style.boxShadow = "none" }}
      className="empty:before:content-[attr(data-ph)] empty:before:text-current/25 empty:before:pointer-events-none"
    />
  )
}

function RichTextEditor({ html, onSave, isDark }: { html: string; onSave: (html: string) => void; isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  
  // Only set innerHTML on mount and restore selection to end
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = html || ""
      ref.current.focus()
      const range = document.createRange()
      range.selectNodeContents(ref.current)
      range.collapse(false)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [html]) // Add html here to ensure edit updates don't wipe everything if it wasn't unmounted

  return (
    <div ref={ref} contentEditable suppressContentEditableWarning
      onBlur={(e) => onSave(e.currentTarget.innerHTML)}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        width: "100%", height: "100%", padding: 8, border: "none", outline: "none",
        background: "rgba(255,255,255,0.1)", fontSize: 16,
        color: isDark ? "#fff" : "#1f2937", fontFamily: "inherit", overflowY: "auto", cursor: "text"
      }}
    />
  )
}

/* ══════════════════════════════════════════════════════════════
   CANVAS ELEMENT (drag + resize + edit)
   ══════════════════════════════════════════════════════════════ */

function CanvasEl({ el, selected, isDark, canvasRef, onSelect, onPatch, onDelete }: {
  el: El; selected: boolean; isDark: boolean
  canvasRef: React.RefObject<HTMLDivElement | null>
  onSelect: () => void; onPatch: (p: Partial<El>) => void; onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const getRect = () => canvasRef.current?.getBoundingClientRect()

  /* ── Drag ── */
  const startDrag = (e: React.MouseEvent) => {
    if (editing) return
    e.preventDefault(); e.stopPropagation(); onSelect()
    const r = getRect(); if (!r) return
    const sx = e.clientX, sy = e.clientY, ox = el.x, oy = el.y
    const move = (ev: MouseEvent) => {
      onPatch({
        x: Math.max(0, Math.min(95 - el.w, ox + ((ev.clientX - sx) / r.width) * 100)),
        y: Math.max(0, Math.min(95 - el.h, oy + ((ev.clientY - sy) / r.height) * 100)),
      })
    }
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up) }
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up)
  }

  /* ── Resize ── */
  const startResize = (e: React.MouseEvent, handle: string) => {
    e.preventDefault(); e.stopPropagation()
    const r = getRect(); if (!r) return
    const sx = e.clientX, sy = e.clientY
    const { x: ox, y: oy, w: ow, h: oh } = el
    const move = (ev: MouseEvent) => {
      const dx = ((ev.clientX - sx) / r.width) * 100
      const dy = ((ev.clientY - sy) / r.height) * 100
      let nx = ox, ny = oy, nw = ow, nh = oh
      if (handle.includes("e")) nw = Math.max(4, ow + dx)
      if (handle.includes("w")) { nw = Math.max(4, ow - dx); nx = ox + (ow - nw) }
      if (handle.includes("s")) nh = Math.max(3, oh + dy)
      if (handle.includes("n")) { nh = Math.max(3, oh - dy); ny = oy + (oh - nh) }
      onPatch({ x: nx, y: ny, w: nw, h: nh })
    }
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up) }
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up)
  }

  const isLine = el.type === "line"

  /* ── Wrapper ── */
  const wrapS: React.CSSProperties = {
    position: "absolute",
    left: `${el.x}%`, top: `${el.y}%`,
    width: `${el.w}%`, height: isLine ? 6 : `${el.h}%`,
    zIndex: selected ? 20 : 5,
    outline: selected ? "2px solid #3b82f6" : "1px dashed transparent",
    outlineOffset: 2,
    cursor: editing ? "text" : "move",
    transition: "outline 0.15s",
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!selected) onSelect()
  }

  const handleDblClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (el.type === "text" || el.type === "note") setEditing(true)
    if (el.type === "image" && !el.src) fileRef.current?.click()
    if (el.type === "rectangle" || el.type === "ellipse") {
      const c = prompt("Color (hex/name):", el.color || "#3b82f6")
      if (c) onPatch({ color: c })
    }
  }

  /* ── Table helpers ── */
  const updateCell = (r: number, c: number, v: string) => {
    const d = (el.tableData || []).map((row) => [...row]); if(d[r]) d[r][c] = v; onPatch({ tableData: d })
  }
  const addRow = () => { const d = [...(el.tableData || [])]; const cols = d[0]?.length || 3; d.push(Array(cols).fill("")); onPatch({ tableData: d }) }
  const addCol = () => { onPatch({ tableData: (el.tableData || []).map((r) => [...r, ""]) }) }
  const delRow = () => { if ((el.tableData || []).length > 1) onPatch({ tableData: (el.tableData || []).slice(0, -1) }) }
  const delCol = () => { if ((el.tableData?.[0]?.length || 0) > 1) onPatch({ tableData: (el.tableData || []).map((r) => r.slice(0, -1)) }) }

  return (
    <div style={wrapS} onClick={handleClick} onDoubleClick={handleDblClick}
      onMouseDown={!editing ? startDrag : undefined}
      onMouseEnter={(e) => { if (!selected) (e.currentTarget as HTMLDivElement).style.outline = "1px dashed #93c5fd" }}
      onMouseLeave={(e) => { if (!selected) (e.currentTarget as HTMLDivElement).style.outline = "1px dashed transparent" }}
    >
      {/* ── TEXT ── */}
      {el.type === "text" && (
        editing ? (
          <RichTextEditor html={el.text || ""} onSave={(html) => { onPatch({ text: html }); setEditing(false) }} isDark={isDark} />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: el.text || `<span style="opacity: 0.3">Double-click to edit</span>` }}
            style={{
              width: "100%", height: "100%", padding: 8, fontSize: 16,
              color: isDark ? "#fff" : "#1f2937", overflow: "hidden",
            }}
          />
        )
      )}

      {/* ── IMAGE ── */}
      {el.type === "image" && (
        <div style={{ width: "100%", height: "100%", background: "#f3f4f6", borderRadius: 4, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {el.src ? (
            <img src={el.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onDoubleClick={() => fileRef.current?.click()} />
          ) : (
            <div style={{ textAlign: "center", color: "#9ca3af" }}>
              <ImageIcon size={32} />
              <div style={{ fontSize: 11, marginTop: 4 }}>Double-click to add image</div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0]; if (!f) return
              const r = new FileReader()
              r.onload = (ev) => onPatch({ src: ev.target?.result as string })
              r.readAsDataURL(f)
            }} />
        </div>
      )}

      {/* ── RECTANGLE / ELLIPSE ── */}
      {(el.type === "rectangle" || el.type === "ellipse") && (
        <div style={{
          width: "100%", height: "100%", background: el.color || "#3b82f6",
          borderRadius: el.type === "ellipse" ? "50%" : 8,
        }} />
      )}

      {/* ── LINE ── */}
      {el.type === "line" && <div style={{ width: "100%", height: 3, background: el.color || "#6b7280", marginTop: 1 }} />}

      {/* ── TABLE ── */}
      {el.type === "table" && (
        <div style={{ width: "100%", height: "100%", overflow: "hidden", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 4, display: "flex", flexDirection: "column" }}>
          {/* Drag handle */}
          <div style={{ padding: "2px 6px", background: "#eff6ff", borderBottom: "1px solid #e5e7eb", cursor: "move", display: "flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 700, color: "#6b7280", userSelect: "none" }}
            onMouseDown={(e) => { e.stopPropagation(); startDrag(e) }}>⣿ TABLE</div>
          <div style={{ flex: 1, overflow: "auto" }} onMouseDown={(e) => e.stopPropagation()}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <tbody>
                {(el.tableData || []).map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{
                        border: "1px solid #e5e7eb", padding: "3px 6px",
                        background: ri === 0 ? "#eff6ff" : "transparent", fontWeight: ri === 0 ? 600 : 400,
                      }}>
                        <input type="text" value={cell} onChange={(e) => updateCell(ri, ci, e.target.value)}
                          style={{ width: "100%", background: "transparent", outline: "none", border: "none", fontSize: 11, color: "#374151" }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selected && (
            <div style={{ display: "flex", gap: 4, padding: 4, borderTop: "1px solid #e5e7eb", background: "#f9fafb", flexWrap: "wrap" }}>
              <MiniBtn label="+ Row" onClick={addRow} /><MiniBtn label="+ Col" onClick={addCol} />
              <MiniBtn label="− Row" onClick={delRow} /><MiniBtn label="− Col" onClick={delCol} />
            </div>
          )}
        </div>
      )}

      {/* ── NOTE ── */}
      {el.type === "note" && (
        <div style={{ width: "100%", height: "100%", background: el.color || "#fef3c7", borderRadius: 4, padding: 8,
          boxShadow: "2px 2px 8px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column",
          cursor: editing ? "text" : "move" }}
          onMouseDown={!editing ? (e) => { e.stopPropagation(); startDrag(e) } : (e) => e.stopPropagation()}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#92400e", marginBottom: 4, cursor: "move", userSelect: "none" }}
            onMouseDown={(e) => { e.stopPropagation(); startDrag(e) }}>📌 NOTE</div>
          {editing ? (
            <RichTextEditor html={el.text || ""} onSave={(html) => { onPatch({ text: html }); setEditing(false) }} isDark={false} />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: el.text || `<span style="opacity: 0.5">Note...</span>` }}
              onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}
              style={{ flex: 1, fontSize: 12, color: "#78350f", overflow: "hidden", cursor: "text" }}
            />
          )}
        </div>
      )}

      {/* ── DELETE BTN ── */}
      {selected && (
        <div onClick={(e) => { e.stopPropagation(); onDelete() }}
          style={{
            position: "absolute", top: -10, right: -10, width: 22, height: 22, borderRadius: 11,
            background: "#ef4444", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.2)", zIndex: 30,
            fontSize: 12, fontWeight: 700,
          }}>
          <X size={12} />
        </div>
      )}

      {/* ── RESIZE HANDLES ── */}
      {selected && !isLine && (
        <>
          {["nw","ne","sw","se","n","s","e","w"].map((h) => {
            const isCorner = h.length === 2
            const size = isCorner ? 10 : 8
            const posStyle: React.CSSProperties = {}
            if (h.includes("n")) posStyle.top = -(size / 2 + 2)
            if (h.includes("s")) posStyle.bottom = -(size / 2 + 2)
            if (h.includes("w")) posStyle.left = -(size / 2 + 2)
            if (h.includes("e")) posStyle.right = -(size / 2 + 2)
            if (h === "n" || h === "s") { posStyle.left = "50%"; posStyle.transform = "translateX(-50%)" }
            if (h === "e" || h === "w") { posStyle.top = "50%"; posStyle.transform = "translateY(-50%)" }
            const cursor = ({ nw: "nwse", ne: "nesw", sw: "nesw", se: "nwse", n: "ns", s: "ns", e: "ew", w: "ew" } as any)[h] + "-resize"
            return (
              <div key={h} onMouseDown={(e) => startResize(e, h)}
                style={{
                  position: "absolute", width: size, height: size, background: "#fff",
                  border: "2px solid #3b82f6", borderRadius: isCorner ? 2 : 1, cursor, zIndex: 30, ...posStyle,
                }} />
            )
          })}
        </>
      )}
    </div>
  )
}

function MiniBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 9, padding: "2px 6px", background: "#3b82f6", color: "#fff", border: "none",
      borderRadius: 3, cursor: "pointer",
    }}>{label}</button>
  )
}

/* ══════════════════════════════════════════════════════════════
   SLIDE CANVAS
   ══════════════════════════════════════════════════════════════ */

function SlideCanvas({ slide, idx, onUpdate, onLiveUpdate, canvasRef, selEl, setSelEl }: {
  slide: any; idx: number; onUpdate: (p: any) => void; onLiveUpdate: (p: any) => void
  canvasRef: React.RefObject<HTMLDivElement | null>; selEl: string | null; setSelEl: (id: string | null) => void
}) {
  const b = bgOf(slide.background)
  const dark = b.dark
  const tc = dark ? "#ffffff" : "#1f2937"
  const elements: El[] = slide.elements || []
  const updField = (f: string, v: string) => onLiveUpdate({ [f]: v })
  const updEl = (id: string, p: Partial<El>) => onUpdate({ elements: elements.map((e) => e.id === id ? { ...e, ...p } : e) })
  const delEl = (id: string) => { onUpdate({ elements: elements.filter((e) => e.id !== id) }); setSelEl(null) }

  return (
    <div ref={canvasRef} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: b.bg, color: tc, transition: "background 0.4s" }}
      onClick={() => setSelEl(null)}>

      {/* Layout fields */}
      {slide.layout === "title" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 60px", gap: 12, textAlign: "center" }}>
          <EditableText value={slide.title || ""} placeholder="Click to add title" onChange={(v) => updField("title", v)}
            style={{ fontSize: 38, fontWeight: 700, letterSpacing: -0.5, width: "100%", textAlign: "center", color: tc }} />
          <div style={{ width: 80, height: 3, background: "#3b82f6", borderRadius: 4 }} />
          <EditableText value={slide.subtitle || ""} placeholder="Click to add subtitle" onChange={(v) => updField("subtitle", v)}
            style={{ fontSize: 18, fontWeight: 300, opacity: 0.7, width: "100%", textAlign: "center", color: tc }} />
        </div>
      )}
      {slide.layout === "content" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "32px 48px", gap: 12 }}>
          <EditableText value={slide.title || ""} placeholder="Click to add title" onChange={(v) => updField("title", v)}
            style={{ fontSize: 28, fontWeight: 600, borderLeft: "4px solid #3b82f6", paddingLeft: 16, color: tc }} />
          <EditableText value={slide.body || ""} placeholder="Click to add text content..." onChange={(v) => updField("body", v)}
            style={{ flex: 1, fontSize: 16, lineHeight: 1.6, opacity: 0.8, color: tc }} />
        </div>
      )}
      {slide.layout === "comparison" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "32px 48px", gap: 12 }}>
          <EditableText value={slide.title || ""} placeholder="Click to add title" onChange={(v) => updField("title", v)}
            style={{ fontSize: 28, fontWeight: 600, textAlign: "center", color: tc }} />
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ border: "2px dashed rgba(127,127,127,0.15)", borderRadius: 12, padding: 12 }}>
              <EditableText value={slide.colLeft || ""} placeholder="Left column..." onChange={(v) => updField("colLeft", v)}
                style={{ fontSize: 14, height: "100%", color: tc }} />
            </div>
            <div style={{ border: "2px dashed rgba(127,127,127,0.15)", borderRadius: 12, padding: 12 }}>
              <EditableText value={slide.colRight || ""} placeholder="Right column..." onChange={(v) => updField("colRight", v)}
                style={{ fontSize: 14, height: "100%", color: tc }} />
            </div>
          </div>
        </div>
      )}
      {slide.layout === "blank" && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <EditableText value={slide.body || ""} placeholder="Blank slide — click to type" onChange={(v) => updField("body", v)}
            style={{ fontSize: 16, textAlign: "center", width: "70%", color: tc }} />
        </div>
      )}

      {/* Canvas elements */}
      {elements.map((el) => (
        <CanvasEl key={el.id} el={el} selected={selEl === el.id} isDark={dark} canvasRef={canvasRef}
          onSelect={() => setSelEl(el.id)} onPatch={(p) => updEl(el.id, p)} onDelete={() => delEl(el.id)} />
      ))}

      <div style={{ position: "absolute", bottom: 6, right: 12, fontSize: 10, opacity: 0.25, fontFamily: "monospace", pointerEvents: "none" }}>{idx + 1}</div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   THUMBNAIL
   ══════════════════════════════════════════════════════════════ */

function Thumb({ slide, idx, active, onClick }: any) {
  const b = bgOf(slide.background)
  return (
    <div onClick={onClick} style={{
      cursor: "pointer", borderRadius: 8, transition: "all 0.2s", position: "relative",
      outline: active ? "2px solid #3b82f6" : "1px solid #e5e7eb",
      boxShadow: active ? "0 4px 12px rgba(59,130,246,0.2)" : "none",
      transform: active ? "scale(1.02)" : "none",
    }}>
      <div style={{ aspectRatio: "16/9", borderRadius: 8, overflow: "hidden", background: b.bg }}>
        <div style={{ padding: 8, height: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ fontSize: 7, fontWeight: 700, color: b.dark ? "#fff" : "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {slide.title || `Slide ${idx + 1}`}
          </div>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.04)", borderRadius: 3 }} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 2, left: 4, fontSize: 8, fontFamily: "monospace", color: "#9ca3af", background: "rgba(255,255,255,0.85)", borderRadius: 3, padding: "0 4px" }}>
        {idx + 1}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   PRESENT MODE
   ══════════════════════════════════════════════════════════════ */

function PresentMode({ slides, start, onClose }: { slides: any[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start)
  const s = slides[i]; if (!s) return null
  const b = bgOf(s.background)
  const tc = b.dark ? "#fff" : "#1f2937"

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { document.exitFullscreen?.().catch(() => {}); onClose() }
      if (e.key === "ArrowRight" || e.key === " ") setI((v) => Math.min(v + 1, slides.length - 1))
      if (e.key === "ArrowLeft") setI((v) => Math.max(v - 1, 0))
    }
    window.addEventListener("keydown", h)
    return () => { window.removeEventListener("keydown", h) }
  }, [slides.length, onClose])

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: b.bg, color: tc, cursor: "none" }}
      onClick={() => setI((v) => Math.min(v + 1, slides.length - 1))}>
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60 }}>
        {s.layout === "title" && <>
          <h1 style={{ fontSize: "5vw", fontWeight: 700 }}>{s.title || "Untitled"}</h1>
          <div style={{ width: 120, height: 4, background: "#3b82f6", borderRadius: 4, margin: "24px 0" }} />
          <p style={{ fontSize: "2.2vw", opacity: 0.6 }}>{s.subtitle || ""}</p>
        </>}
        {s.layout === "content" && <>
          <h2 style={{ fontSize: "3.5vw", fontWeight: 600, borderLeft: "4px solid #3b82f6", paddingLeft: 24, alignSelf: "flex-start" }}>{s.title || ""}</h2>
          <p style={{ fontSize: "1.8vw", opacity: 0.7, marginTop: 32, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{s.body || ""}</p>
        </>}
        {s.layout === "comparison" && <>
          <h2 style={{ fontSize: "3.5vw", fontWeight: 600, textAlign: "center" }}>{s.title || ""}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginTop: 32, width: "100%" }}>
            <p style={{ fontSize: "1.5vw", opacity: 0.7 }}>{s.colLeft || ""}</p>
            <p style={{ fontSize: "1.5vw", opacity: 0.7 }}>{s.colRight || ""}</p>
          </div>
        </>}
        {s.layout === "blank" && <p style={{ fontSize: "1.8vw", opacity: 0.7, textAlign: "center" }}>{s.body || ""}</p>}
      </div>
      <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
        {slides.map((_: any, j: number) => (
          <div key={j} onClick={(e) => { e.stopPropagation(); setI(j) }}
            style={{ width: 8, height: 8, borderRadius: 4, background: j === i ? "#3b82f6" : "rgba(255,255,255,0.3)", cursor: "pointer", transition: "all 0.2s" }} />
        ))}
      </div>
      <div onClick={(e) => { e.stopPropagation(); document.exitFullscreen?.().catch(() => {}); onClose() }}
        style={{ position: "absolute", top: 8, right: 12, color: "rgba(255,255,255,0.3)", fontSize: 12, cursor: "pointer" }}>
        ESC to exit
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN EDITOR
   ══════════════════════════════════════════════════════════════ */

export default function PresentationEditor({ document: doc, onChange }: EditorProps) {
  const [ci, setCi] = useState(0) // current slide index
  const [sel, setSel] = useState<string | null>(null) // selected element
  const [presenting, setPresenting] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const slides: any[] = (doc as any).slides || []
  const cs = slides[ci] // current slide

  /* ── Undo / Redo ── */
  const historyRef = useRef<any[]>([])
  const futureRef = useRef<any[]>([])

  const pushHistory = useCallback(() => {
    historyRef.current.push(JSON.parse(JSON.stringify(slides)))
    if (historyRef.current.length > 40) historyRef.current.shift()
    futureRef.current = []
  }, [slides])

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return
    futureRef.current.push(JSON.parse(JSON.stringify(slides)))
    const prev = historyRef.current.pop()!
    onChange({ ...doc, slides: prev } as any)
  }, [doc, slides, onChange])

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return
    historyRef.current.push(JSON.parse(JSON.stringify(slides)))
    const next = futureRef.current.pop()!
    onChange({ ...doc, slides: next } as any)
  }, [doc, slides, onChange])

  /* ── Slide ops ── */
  const updateSlides = useCallback((ns: any[]) => {
    pushHistory()
    onChange({ ...doc, slides: ns } as any)
  }, [doc, onChange, pushHistory])

  const addSlide = useCallback(() => {
    updateSlides([...slides, { id: crypto.randomUUID(), layout: "content", title: "", body: "", elements: [] }])
    setCi(slides.length)
  }, [slides, updateSlides])

  const dupSlide = useCallback((i: number) => {
    const c = JSON.parse(JSON.stringify({ ...slides[i], id: crypto.randomUUID() }))
    const n = [...slides]; n.splice(i + 1, 0, c); updateSlides(n); setCi(i + 1)
  }, [slides, updateSlides])

  const delSlide = useCallback((i: number) => {
    if (slides.length <= 1) return
    updateSlides(slides.filter((_: any, j: number) => j !== i))
    if (ci >= slides.length - 1) setCi(Math.max(0, slides.length - 2))
  }, [slides, ci, updateSlides])

  const moveSlide = useCallback((i: number, d: -1 | 1) => {
    const t = i + d; if (t < 0 || t >= slides.length) return
    const n = [...slides]; [n[i], n[t]] = [n[t], n[i]]; updateSlides(n); setCi(t)
  }, [slides, updateSlides])

  const patchSlide = useCallback((p: any) => {
    pushHistory()
    onChange({ ...doc, slides: slides.map((s: any, i: number) => i === ci ? { ...s, ...p } : s) } as any)
  }, [doc, slides, ci, onChange, pushHistory])

  // Live patch for continuous text input — debounces history push (one undo checkpoint per 500ms pause)
  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const patchSlideLive = useCallback((p: any) => {
    if (!historyTimerRef.current) {
      pushHistory() // push once at start of typing burst
    } else {
      clearTimeout(historyTimerRef.current)
    }
    historyTimerRef.current = setTimeout(() => { historyTimerRef.current = null }, 500)
    onChange({ ...doc, slides: slides.map((s: any, i: number) => i === ci ? { ...s, ...p } : s) } as any)
  }, [doc, slides, ci, onChange, pushHistory])
  const cycleLayout = useCallback(() => {
    if (!cs) return
    const idx = LAYOUTS.findIndex((l) => l.value === cs.layout)
    patchSlide({ layout: LAYOUTS[(idx + 1) % LAYOUTS.length]!.value })
  }, [cs, patchSlide])

  const cycleTheme = useCallback(() => {
    if (!cs) return
    const idx = BG.findIndex((b) => b.id === cs.background)
    patchSlide({ background: BG[(idx + 1) % BG.length]!.id })
  }, [cs, patchSlide])

    const insertEl = useCallback((type: El["type"]) => {
    const el = makeEl(type)
    const existing = cs?.elements || []
    el.y += (existing.length * 6) % 30
    el.x += (existing.length * 5) % 25
    patchSlide({ elements: [...existing, el] })
    setSel(el.id)
  }, [cs, patchSlide])

  /* ── Formatting & Export ── */
  const doFormat = useCallback((cmd: string) => {
    document.execCommand(cmd, false, undefined)
  }, [])

  // Use a ref so exportToPptx always reads the LATEST doc, not a stale closure
  const docRef = useRef(doc)
  useEffect(() => { docRef.current = doc }, [doc])
  const doExportPptx = useCallback(() => { exportToPptx(docRef.current) }, [])

  const doExportPdf = useCallback(async () => {
    if (!canvasRef.current) return
    const { default: html2canvas } = await import("html2canvas")
    const { jsPDF } = await import("jspdf")
    const pdf = new jsPDF("landscape", "in", [16, 9])
    
    setPresenting(true) // Briefly hide UI elements
    const orig = ci

    try {
      for (let i = 0; i < slides.length; i++) {
        setCi(i)
        // give React time to render the slide and Framer Motion to finish
        await new Promise(r => setTimeout(r, 400))
        if (canvasRef.current) {
          const canvas = await html2canvas(canvasRef.current, { scale: 2, useCORS: true })
          const img = canvas.toDataURL("image/jpeg", 0.9)
          if (i > 0) pdf.addPage()
          pdf.addImage(img, "JPEG", 0, 0, 16, 9)
        }
      }
      pdf.save(`${doc.title || "Presentation"}.pdf`)
    } finally {
      setCi(orig)
      setPresenting(false)
    }
  }, [ci, slides.length, doc.title])

  /* ── Use REFS to avoid stale closures in event listener ── */
  const fns = useRef({ insertEl, cycleLayout, cycleTheme, undo, redo, setPresenting, doFormat, doExportPptx, doExportPdf })
  useEffect(() => { fns.current = { insertEl, cycleLayout, cycleTheme, undo, redo, setPresenting, doFormat, doExportPptx, doExportPdf } },
    [insertEl, cycleLayout, cycleTheme, undo, redo, doExportPptx, doExportPdf])

  useEffect(() => {
    const handler = (e: Event) => {
      const { action, payload } = (e as CustomEvent).detail
      if (action === "insert") fns.current.insertEl(payload)
      if (action === "present") { 
        document.documentElement.requestFullscreen?.().catch(() => {})
        fns.current.setPresenting(true) 
      }
      if (action === "cycle-layout") fns.current.cycleLayout()
      if (action === "cycle-theme") fns.current.cycleTheme()
      if (action === "undo") fns.current.undo()
      if (action === "redo") fns.current.redo()
      if (action === "format") fns.current.doFormat(payload)
      if (action === "export-pptx") fns.current.doExportPptx()
      if (action === "export-pdf") fns.current.doExportPdf()
    }
    window.addEventListener("pres-action", handler)
    return () => window.removeEventListener("pres-action", handler)
  }, []) // ← empty deps! refs always point to latest fns

  /* ── Keyboard ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return
      if (presenting) return
      if (e.key === "Delete" && sel) {
        const cur = slides[ci]
        if (cur) {
          pushHistory()
          onChange({ ...doc, slides: slides.map((s: any, i: number) => i === ci ? { ...s, elements: (s.elements || []).filter((el: any) => el.id !== sel) } : s) } as any)
          setSel(null)
        }
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); fns.current.undo(); return }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); fns.current.redo(); return }
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); setCi((v) => Math.min(v + 1, slides.length - 1)) }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); setCi((v) => Math.max(v - 1, 0)) }
    }
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h)
  }, [presenting, sel, slides, ci, doc, onChange, pushHistory])

  /* ── Render ── */
  return (
    <>
      {presenting && <PresentMode slides={slides} start={ci} onClose={() => setPresenting(false)} />}
      <div style={{ display: "flex", height: "100%", minHeight: 0, overflow: "hidden", background: "linear-gradient(135deg,#f3f4f6,#f9fafb,#f3f4f6)" }}>

        {/* ━━━ Thumbnails ━━━ */}
        <div style={{ width: 210, minWidth: 210, borderRight: "1px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1.5 }}>Slides</span>
            <button onClick={addSlide} title="Add Slide"
              style={{ padding: 4, borderRadius: 6, border: "none", background: "none", color: "#3b82f6", cursor: "pointer" }}>
              <Plus size={14} />
            </button>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
            {slides.map((s: any, i: number) => (
              <div key={s.id} style={{ position: "relative" }} className="group">
                <Thumb slide={s} idx={i} active={i === ci} onClick={() => setCi(i)} />
                {/* Actions pill */}
                <div style={{
                  position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)",
                  display: "none", flexDirection: "column", gap: 2,
                  background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", borderRadius: 6,
                  border: "1px solid #e5e7eb", padding: 2, zIndex: 10,
                }} className="group-hover:!flex">
                  <SmBtn icon={ChevronUp} onClick={() => moveSlide(i, -1)} disabled={i === 0} />
                  <SmBtn icon={ChevronDown} onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1} />
                  <SmBtn icon={Copy} onClick={() => dupSlide(i)} />
                  <SmBtn icon={Trash2} onClick={() => delSlide(i)} disabled={slides.length <= 1} red />
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "6px 14px", borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: 10, color: "#9ca3af", textAlign: "center" }}>
            {ci + 1} / {slides.length}
          </div>
        </div>

        {/* ━━━ Center Canvas ━━━ */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 20 }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 920, aspectRatio: "16/9", maxHeight: "100%",
            borderRadius: 6, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", outline: "1px solid rgba(0,0,0,0.05)" }}>
            <AnimatePresence mode="wait">
              {cs && (
                <motion.div key={cs.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }} style={{ position: "absolute", inset: 0 }}>
                  <SlideCanvas slide={cs} idx={ci} onUpdate={patchSlide} onLiveUpdate={patchSlideLive} canvasRef={canvasRef}
                    selEl={sel} setSelEl={setSel} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ━━━ Properties ━━━ */}
        <div style={{ width: 240, minWidth: 240, borderLeft: "1px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(16px)", padding: 14, display: "flex", flexDirection: "column", gap: 16, overflow: "auto" }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1.5, display: "flex", alignItems: "center", gap: 6 }}>
            <Layers size={13} style={{ color: "#3b82f6" }} /> Properties
          </h3>

          {/* Layout */}
          <PropSection icon={LayoutTemplate} label="Layout">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {LAYOUTS.map((l) => (
                <button key={l.value} onClick={() => patchSlide({ layout: l.value })}
                  style={{
                    padding: "5px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500, border: "1px solid",
                    cursor: "pointer", transition: "all 0.15s",
                    background: cs?.layout === l.value ? "#eff6ff" : "#f9fafb",
                    borderColor: cs?.layout === l.value ? "#93c5fd" : "#e5e7eb",
                    color: cs?.layout === l.value ? "#1d4ed8" : "#6b7280",
                  }}>{l.label}</button>
              ))}
            </div>
          </PropSection>

          {/* Background */}
          <PropSection icon={Palette} label="Background">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {BG.map((b) => (
                <div key={b.id} onClick={() => patchSlide({ background: b.id })}
                  style={{
                    width: 26, height: 26, borderRadius: 13, background: b.bg, cursor: "pointer",
                    border: cs?.background === b.id ? "3px solid #3b82f6" : "2px solid #e5e7eb",
                    transition: "all 0.15s", transform: cs?.background === b.id ? "scale(1.15)" : "none",
                  }} />
              ))}
            </div>
          </PropSection>

          {/* Quick Insert */}
          <PropSection label="Quick Insert">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {([
                { t: "text" as const, i: Type, l: "Text" }, { t: "image" as const, i: ImageIcon, l: "Image" },
                { t: "rectangle" as const, i: Square, l: "Rect" }, { t: "ellipse" as const, i: Circle, l: "Circle" },
                { t: "line" as const, i: Minus, l: "Line" },
              ]).map(({ t, i: Icon, l }) => (
                <button key={t} onClick={() => insertEl(t)}
                  style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 4,
                    border: "1px solid #e5e7eb", fontSize: 10, color: "#6b7280", background: "none", cursor: "pointer" }}>
                  <Icon size={10} />{l}
                </button>
              ))}
            </div>
          </PropSection>

          <div style={{ marginTop: "auto", paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 10, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}><Monitor size={10} /> 16:9 Widescreen</div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>
              Slide {ci + 1} of {slides.length}
              {cs?.elements?.length > 0 && ` · ${cs.elements.length} elements`}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Utility sub-components ── */

function SmBtn({ icon: Icon, onClick, disabled, red }: { icon: any; onClick: () => void; disabled?: boolean; red?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: 3, borderRadius: 4, border: "none", background: "none", cursor: disabled ? "default" : "pointer",
        color: disabled ? "#d1d5db" : red ? "#ef4444" : "#6b7280", opacity: disabled ? 0.5 : 1 }}>
      <Icon size={10} />
    </button>
  )
}

function PropSection({ icon: Icon, label, children }: { icon?: any; label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 500, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
        {Icon && <Icon size={12} />} {label}
      </label>
      {children}
    </div>
  )
}
