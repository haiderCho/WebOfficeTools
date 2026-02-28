import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const STORAGE_DIR = path.join(process.cwd(), "../../storage/documents")

function docPath(id: string) {
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "")
  return path.join(STORAGE_DIR, `${safeId}.json`)
}

// =============================================================================
// GET /api/documents/[id]
// =============================================================================
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const filePath = docPath(id)
    const content = await fs.readFile(filePath, "utf-8")
    return NextResponse.json(JSON.parse(content))
  } catch {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }
}

// =============================================================================
// PUT /api/documents/[id]
// =============================================================================
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const filePath = docPath(id)

    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const body = await request.json()
    const doc = { ...body, id, updatedAt: new Date().toISOString() }
    await fs.writeFile(filePath, JSON.stringify(doc, null, 2), "utf-8")
    return NextResponse.json(doc)
  } catch {
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 })
  }
}

// =============================================================================
// DELETE /api/documents/[id]
// =============================================================================
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const filePath = docPath(id)
    await fs.unlink(filePath)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }
}
