import { LetterRowImp } from '../lib/text-area'

export enum Sign {
  A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z,
  _,
  D0, D1, D2, D3, D4, D5, D6, D7, D8, D9,
  LT, LE, EQ, NE, GE, GT,
  PLUS, MINUS, MUL, DIV, MOD, DOT,
  NOT, OR, AND, TRUE, FALSE, NONE, ASSIGN,
  LPAR, RPAR, LBRA, RBRA, LCURLY, RCURLY,
  IF, ELSE, WHILE, FOR,
  CLASS, FUNCTION, RETURN, CONTINUE, BREAK,
  SPACE, SEMICOLON, QUOTE, COMMA, PROP,
}

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
