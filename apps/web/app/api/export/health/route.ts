import { NextResponse } from "next/server"

const EXPORT_SERVICE_URL = process.env.EXPORT_SERVICE_URL || "http://localhost:3001"

export async function GET() {
  try {
    const response = await fetch(`${EXPORT_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    })
    if (response.ok) {
      return NextResponse.json({ status: "ok" })
    }
    return NextResponse.json({ status: "down" }, { status: 503 })
  } catch {
    return NextResponse.json({ status: "down" }, { status: 503 })
  }
}
