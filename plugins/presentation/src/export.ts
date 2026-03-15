import html2canvas from "html2canvas"
import jsPDF from "jspdf"

/* ════════════════════════════════════════════════
   PPTX EXPORT (Client-side)
   ════════════════════════════════════════════════ */

const BG = [
  { id: "white", bg: "#ffffff" },
  { id: "blue", bg: "#2563eb" },
  { id: "dark", bg: "#111827" },
  { id: "sunset", bg: "#fb923c" },
  { id: "emerald", bg: "#10b981" },
  { id: "slate", bg: "#334155" },
]

export async function exportToPptx(doc: any) {
  // Load pptxgenjs dynamically from CDN to bypass Webpack node polyfill errors
  if (!(window as any).PptxGenJS) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js"
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  const pres = new (window as any).PptxGenJS()
  pres.layout = "LAYOUT_16x9"
  
  const slides = doc.slides || []

  console.log("[PPTX DEBUG] Full doc:", JSON.stringify(doc, null, 2))

  slides.forEach((slide: any, slideIdx: number) => {
    console.log(`[PPTX DEBUG] Slide ${slideIdx}:`, {
      layout: slide.layout,
      title: slide.title,
      subtitle: slide.subtitle,
      body: slide.body,
      background: slide.background,
      elementCount: (slide.elements || []).length,
    })

    const s = pres.addSlide()
    
    // Background
    const bg = BG.find(b => b.id === slide.background) || BG[0]!
    s.background = { color: bg.bg.replace("#", "") }

    // Text color base
    const tc = ["white", "blue", "none", undefined].includes(slide.background) && slide.background !== "blue" ? "1f2937" : "ffffff"

    // Helper to format HTML to plain text roughly
    const stripHtml = (html: string) => {
      if (!html) return ""
      return html.replace(/<[^>]*>?/gm, '')
    }

    // Native Layout elements — use inches (10"×5.625" for LAYOUT_16x9)
    if (slide.layout === "title") {
      const titleText = stripHtml(slide.title) || " "
      const subtitleText = stripHtml(slide.subtitle) || " "
      console.log(`[PPTX DEBUG] Title slide - title: "${titleText}", subtitle: "${subtitleText}", color: "${tc}"`)
      s.addText(titleText, { x: 1, y: 1.5, w: 8, h: 1.2, fontSize: 44, bold: true, align: "center", color: tc })
      s.addShape("rect", { x: 4.5, y: 2.8, w: 1.0, h: 0.05, fill: { color: "3b82f6" } })
      s.addText(subtitleText, { x: 1, y: 3.2, w: 8, h: 0.8, fontSize: 24, align: "center", color: tc })
    }
    if (slide.layout === "content") {
      s.addText(stripHtml(slide.title) || " ", { x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 32, bold: true, color: tc })
      s.addText(stripHtml(slide.body) || " ", { x: 0.5, y: 1.4, w: 9, h: 3.8, fontSize: 18, valign: "top", color: tc })
    }
    if (slide.layout === "comparison") {
      s.addText(stripHtml(slide.title) || " ", { x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 32, bold: true, align: "center", color: tc })
      s.addText(stripHtml(slide.colLeft) || " ", { x: 0.5, y: 1.4, w: 4.2, h: 3.8, fontSize: 16, valign: "top", color: tc })
      s.addText(stripHtml(slide.colRight) || " ", { x: 5.2, y: 1.4, w: 4.2, h: 3.8, fontSize: 16, valign: "top", color: tc })
    }
    if (slide.layout === "blank") {
      s.addText(stripHtml(slide.body) || " ", { x: 1, y: 0.5, w: 8, h: 4.5, fontSize: 18, align: "center", valign: "middle", color: tc })
    }

    // Custom Elements
    const elements = slide.elements || []
    elements.forEach((el: any) => {
      // Map percentage coordinates back to inches (16x9 aspect ratio means 10" x 5.625")
      // PptxGenJS CDN handles numbers as inches safely.
      const x = (el.x / 100) * 10
      const y = (el.y / 100) * 5.625
      const w = (el.w / 100) * 10
      const h = (el.h / 100) * 5.625

      if (el.type === "text") {
        s.addText(stripHtml(el.text) || " ", { x, y, w, h, fontSize: 18, color: tc, valign: "top" })
      }
      if (el.type === "rectangle") {
        s.addShape("rect", { x, y, w, h, fill: { color: (el.color || "3b82f6").replace("#", "") } })
      }
      if (el.type === "ellipse") {
        s.addShape("ellipse", { x, y, w, h, fill: { color: (el.color || "8b5cf6").replace("#", "") } })
      }
      if (el.type === "line") {
        s.addShape("line", { x, y, w, h: 0.05, line: { color: (el.color || "6b7280").replace("#", ""), width: 2 } })
      }
      if (el.type === "image" && el.src) {
        s.addImage({ data: el.src, x, y, w, h })
      }
      if (el.type === "note") {
        s.addShape("rect", { x, y, w, h, fill: { color: "fef3c7" } })
        s.addText(stripHtml(el.text) || " ", { x, y, w, h, fontSize: 14, color: "78350f", valign: "top", margin: 10 })
      }
      if (el.type === "table") {
        const rows = el.tableData.map((r: string[]) => {
          return r.map(c => ({ text: c, options: { fontSize: 12, color: "374151" } }))
        })
        if (rows.length > 0) {
          s.addTable(rows, { x, y, w, h, border: { pt: 1, color: "e5e7eb" } })
        }
      }
    })
  })

  await pres.writeFile({ fileName: `${doc.title || "Presentation"}.pptx` })
}

/* ════════════════════════════════════════════════
   PDF EXPORT (Client-side HTML2Canvas)
   ════════════════════════════════════════════════ */

export async function exportToPdf(doc: any, canvasContainerRef: React.RefObject<HTMLDivElement>) {
  if (!canvasContainerRef.current) return
  
  // Set up PDF for 16:9
  // 1920x1080 -> scale down to a standard PDF page size like A4 landscape, 
  // but let's just use exact pixel coords to maintain ratio: 16 x 9 inches
  const pdf = new jsPDF("landscape", "in", [16, 9])
  
  // We need to render the slides. Since the DOM only has the *current* slide visible,
  // we actually will emit a custom event to the editor to handle PDF render loop
  window.dispatchEvent(new CustomEvent("start-pdf-export", { detail: { pdf, docTitle: doc.title || "Presentation" } }))
}
