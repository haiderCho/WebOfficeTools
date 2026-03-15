import { NextResponse } from "next/server"

const EXPORT_SERVICE_URL = process.env.EXPORT_SERVICE_URL || "http://localhost:3001"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = await fetch(`${EXPORT_SERVICE_URL}/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error || "Export failed" },
        { status: response.status }
      )
    }

    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get("Content-Type") || "application/octet-stream"
    const contentDisposition = response.headers.get("Content-Disposition") || ""

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
      },
    })
  } catch (error) {
    console.error("Export proxy error:", error)
    return NextResponse.json(
      { error: "Export service is unreachable. Make sure the export-service is running." },
      { status: 502 }
    )
  }
}
