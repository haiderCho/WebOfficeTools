import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType,
  BorderStyle,
  TableOfContents,
  ImageRun,
} from "docx";

export async function exportDocx(editor: any, options: { 
  pageSize: string, 
  margin: string 
} = { pageSize: 'A4', margin: 'normal' }) {
  const json = editor.getJSON();
  const content = json.content || [];

  const doc = new Document({
    numbering: {
        config: [
            {
                reference: "default-numbering",
                levels: [
                    { level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.LEFT },
                    { level: 1, format: "lowerLetter", text: "%2)", alignment: AlignmentType.LEFT },
                ],
            },
        ],
    },
    sections: [
      {
        properties: {
          page: {
             size: getPageSize(options.pageSize),
             margin: getMargins(options.margin),
          },
        },
        children: content.map((node: any) => parseNode(node)).filter(Boolean).flat(),
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `document-${new Date().getTime()}.docx`;
  
  // Using a dynamic import for file-saver to avoid SSR issues
  const FileSaver = await import("file-saver");
  const saveAs = (FileSaver as any).saveAs || (FileSaver as any).default?.saveAs || (FileSaver as any).default;
  
  if (typeof saveAs === "function") {
    saveAs(blob, fileName);
  } else {
    console.error("saveAs is not a function", saveAs);
  }
}

export async function exportPdf(editor: any, options: {
  pageSize: string,
  margin: string
} = { pageSize: 'A4', margin: 'normal' }) {
  const { jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;

  const element = editor.view.dom as HTMLElement;
  const fileName = `document-${new Date().getTime()}.pdf`;

  // Standardized 96 DPI constants
  const dimensions = {
    A3: { width: 1123, height: 1587, format: 'a3' },
    A4: { width: 794, height: 1123, format: 'a4' },
    Letter: { width: 816, height: 1056, format: 'letter' },
    Tabloid: { width: 1056, height: 1632, format: 'tabloid' }
  } as any;

  const current = dimensions[options.pageSize] || dimensions.A4;
  const marginPx = options.margin === 'narrow' ? 48 : options.margin === 'wide' ? 192 : 96;
  
  // PDF needs mm for its constructor, but we'll work in pixels and scale
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: current.format,
  });

  const pageWidthMm = pdf.internal.pageSize.getWidth();
  const pageHeightMm = pdf.internal.pageSize.getHeight();
  
  // Ratio to convert pixels to mm based on the target PDF page size
  const pxToMm = pageWidthMm / current.width;
  
  const contentWidthPx = current.width - (marginPx * 2);
  const contentHeightPx = current.height - (marginPx * 2);
  const marginMm = marginPx * pxToMm;

  const canvas = await html2canvas(element, {
    scale: 2, 
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    ignoreElements: (el) => {
      return el.classList.contains('page-spacer') || 
             (el.hasAttribute('data-type') && el.getAttribute('data-type') === 'page-break');
    },
    onclone: (clonedDoc) => {
      const clonedElement = clonedDoc.querySelector('.word-editor-content') as HTMLElement;
      if (clonedElement) {
        clonedElement.style.setProperty('padding', '0', 'important');
        clonedElement.style.setProperty('margin', '0', 'important');
        clonedElement.style.setProperty('border', 'none', 'important');
        clonedElement.style.setProperty('box-shadow', 'none', 'important');
        clonedElement.style.setProperty('width', `${contentWidthPx}px`, 'important');
        
        const parent = clonedElement.parentElement;
        if (parent) {
          parent.style.padding = '0';
          parent.style.margin = '0';
        }
      }
    }
  });

  const imgData = canvas.toDataURL("image/png");
  const totalImgHeightPx = canvas.height / 2;
  const imgWidthMm = pageWidthMm - (marginMm * 2);
  const sliceImgHeightMm = (totalImgHeightPx * imgWidthMm) / (canvas.width / 2);

  let heightLeftPx = totalImgHeightPx;
  let pageNum = 0;

  while (heightLeftPx > 0) {
    if (pageNum > 0) pdf.addPage(current.format);
    
    const yOffsetMm = marginMm - (pageNum * contentHeightPx * pxToMm);

    pdf.addImage(imgData, "PNG", marginMm, yOffsetMm, imgWidthMm, sliceImgHeightMm);
    
    // Mask margins
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidthMm, marginMm, 'F'); // Top
    pdf.rect(0, pageHeightMm - marginMm, pageWidthMm, marginMm, 'F'); // Bottom
    pdf.rect(0, 0, marginMm, pageHeightMm, 'F'); // Left
    pdf.rect(pageWidthMm - marginMm, 0, marginMm, pageHeightMm, 'F'); // Right

    heightLeftPx -= contentHeightPx;
    pageNum++;
  }

  pdf.save(fileName);
}

function parseNode(node: any): any {
  switch (node.type) {
    case "paragraph":
      return new Paragraph({
        children: parseTextNodes(node.content),
        alignment: parseAlignment(node.attrs?.textAlign),
      });
    case "heading":
      let headingLevel: any = HeadingLevel.HEADING_1;
      if (node.attrs?.level === 2) headingLevel = HeadingLevel.HEADING_2;
      if (node.attrs?.level === 3) headingLevel = HeadingLevel.HEADING_3;
      
      return new Paragraph({
        children: parseTextNodes(node.content),
        heading: headingLevel,
        alignment: parseAlignment(node.attrs?.textAlign),
      });
    case "bulletList":
    case "orderedList":
      const isOrdered = node.type === "orderedList";
      return node.content?.map((item: any, index: number) => {
          const itemContent = item.content?.[0]?.content || item.content || [];
          return new Paragraph({
            children: parseTextNodes(itemContent),
            bullet: !isOrdered ? { level: 0 } : undefined,
            numbering: isOrdered ? { reference: "default-numbering", level: 0 } : undefined,
            alignment: parseAlignment(item.attrs?.textAlign),
          });
      }).flat();
    case "taskList":
      return node.content?.map((item: any) => {
          const itemContent = item.content?.[0]?.content || item.content || [];
          const isChecked = !!item.attrs?.checked;
          return new Paragraph({
              children: [
                  new TextRun({ text: isChecked ? "☑ " : "☐ ", font: "MS Gothic" }),
                  ...parseTextNodes(itemContent)
              ],
              alignment: parseAlignment(item.attrs?.textAlign),
          });
      }).flat();
    case "table":
      return new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: node.content?.map((row: any) => new TableRow({
          children: row.content?.map((cell: any) => new TableCell({
            children: (cell.content || []).map((c: any) => parseNode(c)).filter(Boolean).flat(),
          })),
        })),
      });
    case "listItem":
    case "taskItem":
      return new Paragraph({
        children: parseTextNodes(node.content?.[0]?.content || node.content), 
        bullet: { level: 0 }, 
        alignment: parseAlignment(node.attrs?.textAlign),
      });
    case "math":
      return new Paragraph({
          children: [new TextRun({ text: `f(x) = ${node.attrs?.tex || ""}`, color: "2362af", italics: true })],
          alignment: AlignmentType.CENTER
      });
    case "codeBlock":
      return new Paragraph({
          children: node.content?.map((c: any) => new TextRun({ text: c.text, font: "Courier New" })) || [],
          shading: { fill: "f4f4f4" },
          border: { 
              top: { style: BorderStyle.SINGLE, size: 4 },
              bottom: { style: BorderStyle.SINGLE, size: 4 },
              left: { style: BorderStyle.SINGLE, size: 4 },
              right: { style: BorderStyle.SINGLE, size: 4 },
          }
      });
    case "image":
      // Docx image insertion is complex (needs buffer), usually we skip in frontend-only
      // unless we fetch. For now, skip or insert a placeholder text
      return new Paragraph({
        children: [new TextRun({ text: "[Image]", color: "888888" })],
      });
    case "blockquote":
      return new Paragraph({
        children: parseTextNodes(node.content),
        indent: { left: 720 }, // Standard indent for blockquote
      });
    case "horizontalRule":
        return new Paragraph({ 
            border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } } 
        });
    case "pageBreak":
        return null; // Ignore manual page breaks in DOCX for now, docx handles its own paging
    default:
      return null;
  }
}

function parseTextNodes(content: any[] = []): TextRun[] {
  return (content || []).map((node: any) => {
    if (node.type === "text") {
      const marks = node.marks || [];
      const textStyle = marks.find((m: any) => m.type === "textStyle")?.attrs || {};
      const highlight = marks.find((m: any) => m.type === "highlight")?.attrs?.color;
      const link = marks.find((m: any) => m.type === "link")?.attrs?.href;

      const hasBold = !!marks.find((m: any) => m.type === "bold");
      const hasItalic = !!marks.find((m: any) => m.type === "italic");
      const hasUnderline = !!marks.find((m: any) => m.type === "underline");
      const hasStrike = !!marks.find((m: any) => m.type === "strike");
      const hasSubscript = !!marks.find((m: any) => m.type === "subscript");
      const hasSuperscript = !!marks.find((m: any) => m.type === "superscript");

      return new TextRun({
        text: node.text,
        bold: hasBold ? true : undefined,
        italics: hasItalic ? true : undefined,
        underline: hasUnderline ? {} : undefined,
        strike: hasStrike ? true : undefined,
        subScript: hasSubscript ? true : undefined,
        superScript: hasSuperscript ? true : undefined,
        color: textStyle.color?.replace('#', ''),
        shading: highlight ? { fill: highlight.replace('#', '') } : undefined,
        size: parseFontSize(textStyle.fontSize),
        // Note: Links are ideally handled via a different wrapper in docx, 
        // but for inline simplicity we just style them as blue/underlined if present here 
        // or we can use ExternalHyperlink if we refactor. 
        // For now, let's keep it styled.
        ...(link ? { color: "0000FF", underline: {} } : {}),
      });
    }
    // Handle nested parsing for recursive nodes if they appear in content
    if (node.type === "hardBreak") {
        return new TextRun({ text: "", break: 1 });
    }
    return null;
  }).filter(Boolean) as TextRun[];
}

function parseAlignment(align?: string) {
  if (align === "center") return AlignmentType.CENTER;
  if (align === "right") return AlignmentType.RIGHT;
  if (align === "justify") return AlignmentType.JUSTIFIED;
  return AlignmentType.LEFT;
}

function parseFontSize(size?: string) {
  if (!size) return undefined;
  const num = parseInt(size.replace("pt", ""));
  return isNaN(num) ? undefined : num * 2; // docx uses half-points
}

function getPageSize(size: string) {
  switch (size) {
    case 'A3': return { width: 16838, height: 23811 };
    case 'Letter': return { width: 12240, height: 15840 };
    case 'Tabloid': return { width: 15840, height: 24480 };
    default: return { width: 11906, height: 16838 }; // A4
  }
}

function getMargins(margin: string) {
  switch (margin) {
    case 'narrow': return { top: 720, right: 720, bottom: 720, left: 720 };
    case 'wide': return { top: 1440, right: 2880, bottom: 1440, left: 2880 };
    default: return { top: 1440, right: 1440, bottom: 1440, left: 1440 }; // normal 1 inch
  }
}
