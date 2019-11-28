import { immerable } from 'immer'
import { Sign } from '~/interpreter/ast/sign'
import { LetterSize } from '../types/ide'
import { Letter, LetterRow, PositionPixels, PositionRowCol, Text } from '../types/text-area'

function CreateId(): string {
  // Source: https://stackoverflow.com/a/8084248
  return Math.random().toString(36).substr(2, 5)
}

export class LetterImp implements Letter {
  [immerable] = true
  readonly id: string

  constructor(readonly sign: Sign) {
    this.id = `${sign}_${CreateId()}`
  }
}

export class LetterRowImp implements LetterRow {
  [immerable] = true
  readonly id: string
  constructor(readonly letters: Letter[]) {
    this.id = CreateId()
  }
}

export function TrimPositionRowCol(position: PositionRowCol, text: Text):
  PositionRowCol {
  const rowLength = (text.length > 0) ? text.length - 1 : 0
  const row = Math.min(rowLength, position.row)
  const colLength = (text.length > 0) ? text[row].letters.length : 0
  const col = Math.min(colLength, position.col)
  return { row, col }
}

export function PositionPixelsToRowCol(
  letterSize: LetterSize, position: PositionPixels): PositionRowCol {
  const boxSize = letterSize.edgePx + 2 * letterSize.marginPx
  const row = Math.floor(position.y / boxSize)
  const col = Math.floor((position.x + boxSize / 2) / boxSize)

  return { row, col }
}

export function PositionRowColToPixels(
  letterSize: LetterSize, position: PositionRowCol): PositionPixels {
  const boxSize = letterSize.edgePx + 2 * letterSize.marginPx
  const x = position.col * boxSize
  const y = position.row * boxSize
  return { x, y }
}

// Expects cursor to be in a valid state.
export function MoveCursorRight(
  position: PositionRowCol, text: Text): PositionRowCol {
  const rowWidth = text[position.row].letters.length
  if (position.col + 1 <= rowWidth) {
    return { row: position.row, col: position.col + 1 }
  } else if (position.row + 1 < text.length) {
    return { row: position.row + 1, col: 0 }
  } else {
    return position
  }
}

// Expects cursor to be in a valid state.
export function MoveCursorLeft(
  position: PositionRowCol, text: Text): PositionRowCol {
  if (position.col - 1 >= 0) {
    return { row: position.row, col: position.col - 1 }
  } else if (position.row - 1 >= 0) {
    return { row: position.row - 1, col: text[position.row - 1].letters.length }
  } else {
    return position
  }
}

// Expects cursor to be in a valid state.
export function MoveCursorUp(
  position: PositionRowCol, text: Text): PositionRowCol {
  const rowUp = position.row - 1
  if (rowUp >= 0) {
    return {
      row: rowUp,
      col: Math.min(position.col, text[rowUp].letters.length)
    }
  } else {
    return {
      row: 0,
      col: 0
    }
  }
}

// Expects cursor to be in a valid state.
export function MoveCursorDown(
  position: PositionRowCol, text: Text): PositionRowCol {
  const rowDown = position.row + 1
  if (rowDown < text.length) {
    return {
      row: rowDown,
      col: Math.min(position.col, text[rowDown].letters.length)
    }
  } else {
    const lastRow = text.length - 1
    return {
      row: lastRow,
      col: text[lastRow].letters.length
    }
  }
}
