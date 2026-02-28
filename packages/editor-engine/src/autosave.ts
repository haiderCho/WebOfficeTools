import type { Document } from "@opensuite/core"

// =============================================================================
// Autosave — debounced save utility
// =============================================================================

export interface AutosaveOptions {
  /** Delay in ms before saving after last change (default: 2000) */
  debounceMs?: number
  /** Callback to execute save */
  onSave: (doc: Document) => Promise<void>
  /** Called when save starts */
  onSaveStart?: () => void
  /** Called when save completes */
  onSaveEnd?: () => void
  /** Called on save error */
  onSaveError?: (error: unknown) => void
}

export interface AutosaveHandle {
  /** Trigger a save (debounced) */
  trigger: (doc: Document) => void
  /** Force an immediate save */
  flush: () => Promise<void>
  /** Cancel any pending save */
  cancel: () => void
  /** Destroy the autosave instance */
  dispose: () => void
}

export function createAutosave(options: AutosaveOptions): AutosaveHandle {
  const { debounceMs = 2000, onSave, onSaveStart, onSaveEnd, onSaveError } = options

  let timer: ReturnType<typeof setTimeout> | null = null
  let pendingDoc: Document | null = null
  let saving = false

  async function executeSave(): Promise<void> {
    if (!pendingDoc || saving) return
    const doc = pendingDoc
    pendingDoc = null
    saving = true

    try {
      onSaveStart?.()
      await onSave(doc)
      onSaveEnd?.()
    } catch (err) {
      onSaveError?.(err)
    } finally {
      saving = false
    }
  }

  function trigger(doc: Document): void {
    pendingDoc = doc
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      executeSave()
    }, debounceMs)
  }

  async function flush(): Promise<void> {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    await executeSave()
  }

  function cancel(): void {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    pendingDoc = null
  }

  function dispose(): void {
    cancel()
  }

  return { trigger, flush, cancel, dispose }
}
