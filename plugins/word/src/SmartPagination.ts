import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface SmartPaginationOptions {
  pageHeightMm: number
  pageGapPx: number
  enabled: boolean
}

/**
 * SmartPagination Extension
 * Creates "Actual" Word-style page breaks by injecting DOM spacers (widgets)
 * that physically push content to the next sheet based on rendered height.
 */
export const SmartPagination = Extension.create<SmartPaginationOptions>({
  name: 'smartPagination',

  addOptions() {
    return {
      pageHeightMm: 297, // A4 default
      pageGapPx: 30,
      enabled: true,
    }
  },

  addProseMirrorPlugins() {
    const options = this.options

    return [
      new Plugin({
        key: new PluginKey('smartPagination'),
        state: {
          init: () => DecorationSet.empty,
          apply(tr, set) {
            const nextSet = tr.getMeta('paginationUpdate')
            if (nextSet) return nextSet
            return set.map(tr.mapping, tr.doc)
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
        view(editorView) {
          // Use exact pixel heights from standardized constants
          const pageHeights: Record<number, number> = {
            297: 1123, // A4
            420: 1587, // A3
            279.4: 1056 // Letter
          }
          const pageHeight = pageHeights[options.pageHeightMm] || (options.pageHeightMm * 3.7795)

          const updatePagination = () => {
            const { state } = editorView
            const { enabled } = options
            
            if (!enabled) {
              const tr = editorView.state.tr.setMeta('paginationUpdate', DecorationSet.empty)
              editorView.dispatch(tr)
              return
            }

            const decorations: Decoration[] = []
            const editorDom = editorView.dom as HTMLElement
            
            // Get all block-level children
            const children = Array.from(editorDom.children)
            if (children.length === 0) return

            let pageIndex = 1
            const editorRect = editorDom.getBoundingClientRect()

            // We need to be careful: as we add widgets, the DOM positions of subsequent nodes change.
            // However, Decoration.widget doesn't physically push the DOM *during* this loop.
            // It only pushes *after* dispatch. So we calculate based on the CURRENT DOM state.
            
            children.forEach((child) => {
              const element = child as HTMLElement
              if (element.classList.contains('page-spacer')) return

              const rect = element.getBoundingClientRect()
              const relativeTop = rect.top - editorRect.top
              const relativeBottom = rect.bottom - editorRect.top
              
              // While the bottom of this node is beyond the current page boundary,
              // we need to insert a break.
              // Note: A single very long node could technically span multiple pages,
              // but Tiptap usually works with smaller blocks (paragraphs).
              
              while (relativeBottom > (pageHeight * pageIndex)) {
                 // If the node starts AFTER the boundary, it's already pushed.
                 // If it OVERLAPS, we push it.
                 try {
                     const pos = editorView.posAtDOM(element, 0)
                     
                     const container = document.createElement('div')
                     container.className = 'page-spacer'
                     container.setAttribute('data-page', (++pageIndex).toString())
                     
                     decorations.push(
                        Decoration.widget(pos, container, {
                            side: -1,
                            marks: []
                        })
                     )
                     
                     // Once we push a node, we assume it now starts at the top of the next page.
                     // We don't need to break for this specific node again unless it's taller than a page.
                     // (Standard paragraphs aren't, but big images might be).
                     break; 
                 } catch (e) {
                     break;
                 }
              }
              
              // Sync pageIndex if we are already deep in the doc
              if (relativeTop > (pageHeight * pageIndex)) {
                  pageIndex = Math.floor(relativeTop / pageHeight) + 1
              }
            })

            const decorationSet = DecorationSet.create(state.doc, decorations)
            const tr = editorView.state.tr.setMeta('paginationUpdate', decorationSet)
            editorView.dispatch(tr)
          }

          const timer = setTimeout(updatePagination, 300)

          return {
            update(view, prevState) {
              if (view.state.doc.content.size !== prevState.doc.content.size) {
                clearTimeout(timer)
                setTimeout(updatePagination, 400)
              }
            },
            destroy() {
                clearTimeout(timer)
            }
          }
        }
      }),
    ]
  },
})
