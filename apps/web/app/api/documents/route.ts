import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { createDocument } from "@opensuite/core"
import type { DocumentType } from "@opensuite/core"

const STORAGE_DIR = path.join(process.cwd(), "../../storage/documents")

async function ensureStorageDir() {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
}

// =============================================================================
// GET /api/documents — List all documents
// =============================================================================
export async function GET() {
  try {
    await ensureStorageDir()
    const files = await fs.readdir(STORAGE_DIR)
    const docs = []

    for (const file of files) {
      if (!file.endsWith(".json")) continue
      try {
        const content = await fs.readFile(
          path.join(STORAGE_DIR, file),
          "utf-8"
        )
        const doc = JSON.parse(content)
        docs.push(doc)
      } catch {
        // Skip corrupted files
      }
    }

    // Sort by updatedAt descending
    docs.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    return NextResponse.json(docs)
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list documents" },
      { status: 500 }
    )
  }
}

// =============================================================================
// POST /api/documents — Create a new document
// =============================================================================
export async function POST(request: Request) {
  try {
    await ensureStorageDir()
    const body = await request.json()
    const { type, title } = body as { type: DocumentType; title: string }

    if (!type || !title) {
      return NextResponse.json(
        { error: "type and title are required" },
        { status: 400 }
      )
    }

    const doc = createDocument(type, title)

    // Save to filesystem
    await fs.writeFile(
      path.join(STORAGE_DIR, `${doc.id}.json`),
      JSON.stringify(doc, null, 2),
      "utf-8"
    )

    return NextResponse.json(doc, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    )
  }
}
