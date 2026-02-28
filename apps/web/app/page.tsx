"use client"

import { Sidebar } from "../components/shell/Sidebar"
import { Topbar } from "../components/shell/Topbar"
import { Dashboard } from "../components/Dashboard"

export default function HomePage() {
  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="OpenSuite" />
        <main className="flex-1 overflow-auto">
          <Dashboard />
        </main>
      </div>
    </>
  )
}
