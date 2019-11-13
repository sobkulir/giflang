import { Sign } from '../../lib/sign'

interface LetterSize {
  edgePx: number
  marginPx: number
}

interface Letter {
  id: string
  sign: Sign
}

interface LetterRow {
  id: string
  letters: Letter[]
}

type AlphabetCategory = { name: string, signs: Sign[] }
type CategorizedAlphabet = AlphabetCategory[]
type Text = LetterRow[]
type FileName = string
type SignToGifMap = Map<Sign, FileName>

interface PositionPixels {
  x: number
  y: number
}

interface PositionRowCol {
  row: number
  col: number
}

enum RunState {
  STARTING, RUNNING, NOT_RUNNING
}

interface ExecutionState {
  state: RunState
  output: string
  worker: Worker | null
  goToNextStep: () => void
}

interface EditorState {
  text: Text,
  cursorPosition: PositionRowCol
  letterSize: LetterSize,
  signToGifMap: SignToGifMap,
  alphabet: CategorizedAlphabet,
  execution: ExecutionState,
}


export { EditorState, RunState, Text, ExecutionState, LetterSize, SignToGifMap, PositionRowCol, PositionPixels, Letter, LetterRow, CategorizedAlphabet, AlphabetCategory }

