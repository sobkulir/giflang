import { Sign } from '../../interpreter/ast/sign'
import { LetterRowImp } from '../lib/text-area'

export interface Letter {
  id: string
  sign: Sign
}

export interface LetterRow {
  id: string
  letters: Letter[]
}

export type Text = LetterRow[]

export interface PositionPixels {
  x: number
  y: number
}

export interface PositionRowCol {
  row: number
  col: number
}

export enum ScrollableType {
  CURSOR, HIGHLIGHT, NONE
}
export interface TextArea {
  text: Text,
  cursorPosition: PositionRowCol,
  scroll: ScrollableType,
}

export enum TextAreaType {
  MAIN_EDITOR = 'mainEditor', EXECUTION_INPUT = 'executionInput'
}

export type TextAreaMap = { [x in TextAreaType]: TextArea }

export const createEmptyText = (): Text => [new LetterRowImp([])]
