"use client"

import { useParams } from "next/navigation"
import { Sidebar } from "../../../components/shell/Sidebar"
import { Topbar } from "../../../components/shell/Topbar"
import { StatusBar } from "../../../components/shell/StatusBar"
import { EditorHost } from "../../../components/EditorHost"

export default function EditorPage() {
  const params = useParams()
  const docId = params.docId as string

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <EditorHost docId={docId} />
        <StatusBar />
      </div>
    </>
  )
}
