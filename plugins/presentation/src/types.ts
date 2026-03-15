import type { Document } from "@opensuite/core"

export type SlideLayout = "title" | "content" | "blank" | "comparison"

export interface SlideContent {
  id: string
  layout: SlideLayout
  title?: string
  subtitle?: string
  body?: string
  colLeft?: string
  colRight?: string
  background?: string
  transition?: string
}

export interface PresentationData extends Document {
  slides: SlideContent[]
  theme: string
}
