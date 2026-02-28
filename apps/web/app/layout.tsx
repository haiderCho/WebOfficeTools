import type { Metadata } from "next"
import "./globals.css"
import { PluginInitializer } from "../components/PluginInitializer"

export const metadata: Metadata = {
  title: "OpenSuite — Web Office Platform",
  description:
    "A browser-first, modular office suite for documents, spreadsheets, slides, and more.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-gray-950 antialiased">
        <PluginInitializer />
        <div className="flex h-screen overflow-hidden">{children}</div>
      </body>
    </html>
  )
}
