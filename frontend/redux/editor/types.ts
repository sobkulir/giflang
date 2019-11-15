import { Sign } from '../../lib/sign'

export interface LetterSize {
  edgePx: number
  marginPx: number
}

export interface Letter {
  id: string
  sign: Sign
}

export interface LetterRow {
  id: string
  letters: Letter[]
}

export type AlphabetCategory = { name: string, signs: Sign[] }
export type CategorizedAlphabet = AlphabetCategory[]
export type Text = LetterRow[]
export type FileName = string
export type SignToGifMap = Map<Sign, FileName>

export interface PositionPixels {
  x: number
  y: number
}

export interface PositionRowCol {
  row: number
  col: number
}

export enum RunState {
  STARTING, RUNNING, DEBUG_WAITING, DEBUG_RUNNING, NOT_RUNNING
}

export interface ExecutionState {
  state: RunState
  output: string
  worker: Worker | null
  resolveNextStep: () => void
  lineno: number
}

export interface EditorState {
  text: Text,
  cursorPosition: PositionRowCol
  letterSize: LetterSize,
  signToGifMap: SignToGifMap,
  alphabet: CategorizedAlphabet,
  execution: ExecutionState,
}
