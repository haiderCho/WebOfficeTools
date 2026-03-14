/**
 * Converts column index to letter (0 -> A, 1 -> B, etc.)
 */
export function colToLabel(col: number): string {
  let label = ""
  let n = col
  while (n >= 0) {
    label = String.fromCharCode((n % 26) + 65) + label
    n = Math.floor(n / 26) - 1
  }
  return label
}

/**
 * Converts row/col to cell key (0,0 -> A1)
 */
export function toCellKey(row: number, col: number): string {
  return `${colToLabel(col)}${row + 1}`
}

/**
 * Converts cell key to row/col (A1 -> [0, 0])
 */
export function fromCellKey(key: string): [number, number] {
  const match = key.match(/^([A-Z]+)(\d+)$/)
  if (!match) return [0, 0]
  
  const [, label, rowStr] = match
  let col = 0
  for (let i = 0; i < label.length; i++) {
    col = col * 26 + (label.charCodeAt(i) - 64)
  }
  return [parseInt(rowStr, 10) - 1, col - 1]
}

/**
 * Converts Record<string, CellData> to 2D array for Handsontable
 */
export function cellsToGrid(cells: Record<string, any>, rows = 50, cols = 26): any[][] {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(""))
  
  Object.entries(cells).forEach(([key, data]) => {
    const [row, col] = fromCellKey(key)
    if (row < rows && col < cols) {
      grid[row][col] = data.value
    }
  })
  
  return grid
}
