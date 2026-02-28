import type { Transaction } from "./transactions"

// =============================================================================
// History Manager — undo/redo stack for transactions
// =============================================================================

export class HistoryManager {
  private undoStack: Transaction[][] = []
  private redoStack: Transaction[][] = []
  private maxHistory = 100

  /**
   * Push a batch of transactions as a single undo-able group.
   */
  push(transactions: Transaction[]): void {
    if (transactions.length === 0) return
    this.undoStack.push(transactions)
    this.redoStack = [] // Clear redo on new action
    // Limit stack size
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift()
    }
  }

  /**
   * Pop the last transaction batch for undo.
   */
  undo(): Transaction[] | undefined {
    const batch = this.undoStack.pop()
    if (batch) {
      this.redoStack.push(batch)
    }
    return batch
  }

  /**
   * Pop from redo stack.
   */
  redo(): Transaction[] | undefined {
    const batch = this.redoStack.pop()
    if (batch) {
      this.undoStack.push(batch)
    }
    return batch
  }

  canUndo(): boolean {
    return this.undoStack.length > 0
  }

  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  clear(): void {
    this.undoStack = []
    this.redoStack = []
  }

  get undoCount(): number {
    return this.undoStack.length
  }

  get redoCount(): number {
    return this.redoStack.length
  }
}
