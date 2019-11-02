import { Sign } from './sign'

enum EditorActionType {
  SET_CURSOR_POSITION = 'SET_CURSOR_POSITION',
}

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
}

export { EditorState, Text, EditorActionType, LetterSize, SignToGifMap, PositionRowCol, PositionPixels, Letter, LetterRow }

