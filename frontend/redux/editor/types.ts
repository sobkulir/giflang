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

interface EditorState {
  text: Text,
  cursorPosition: PositionRowCol
  letterSize: LetterSize,
  signToGifMap: SignToGifMap,
  alphabet: CategorizedAlphabet
}

export { EditorState, Text, LetterSize, SignToGifMap, PositionRowCol, PositionPixels, Letter, LetterRow, CategorizedAlphabet, AlphabetCategory }
