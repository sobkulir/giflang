
export enum Sign {
  A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z,
  a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z,
  _,
  D0, D1, D2, D3, D4, D5, D6, D7, D8, D9,
  LT, LE, EQ, NE, GE, GT,
  PLUS, MINUS, MUL, DIV, MOD,
  NOT, OR, AND, TRUE, FALSE, NONE, ASSIGN,
  LPAR, RPAR, LBRA, RBRA, LCURLY, RCURLY,
  IF, ELSE, WHILE, FOR,
  CLASS, FUNCTION, RETURN, CONTINUE, BREAK,
  SPACE, SEMICOLON, QUOTE, COMMA, PROP,
}

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

export interface EditorState {
  text: Text,
  cursorPosition: PositionRowCol
  letterSize: LetterSize,
  signToGifMap: SignToGifMap,
  alphabet: CategorizedAlphabet,
}
