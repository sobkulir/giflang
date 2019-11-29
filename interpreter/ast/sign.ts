export enum Sign {
  A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z,
  _, SPACE, SEMICOLON, QUOTE, COMMA, PROP,
  D0, D1, D2, D3, D4, D5, D6, D7, D8, D9,
  AUX0, AUX1, AUX2, AUX3, AUX4, AUX5, AUX6, AUX7, AUX8, AUX9, AUX10, AUX11,
  LT, LE, EQ, NE, GE, GT,
  PLUS, MINUS, MUL, DIV, MOD, DOT,
  NOT, OR, AND, TRUE, FALSE, NONE, ASSIGN,
  LPAR, RPAR, LBRA, RBRA, LCURLY, RCURLY,
  IF, ELSE, WHILE, FOR,
  CLASS, FUNCTION, RETURN, CONTINUE, BREAK,
}

export const PrintSign = Sign.AUX10
export const PrintToken = Sign[Sign.AUX10].toString()
export const InputSign = Sign.AUX11

const signStrings: Set<string> = new Set(Object.keys(Sign)
  .map((key) => Sign[key as any])
  .filter((value) => typeof value === 'string') as string[])

export const signToCharMap: Map<Sign, string> = new Map([
  [Sign.A, 'A'], [Sign.B, 'B'], [Sign.C, 'C'], [Sign.D, 'D'], [Sign.E, 'E'],
  [Sign.F, 'F'], [Sign.G, 'G'], [Sign.H, 'H'], [Sign.I, 'I'], [Sign.J, 'J'],
  [Sign.K, 'K'], [Sign.L, 'L'], [Sign.M, 'M'], [Sign.N, 'N'], [Sign.O, 'O'],
  [Sign.P, 'P'], [Sign.Q, 'Q'], [Sign.R, 'R'], [Sign.S, 'S'], [Sign.T, 'T'],
  [Sign.U, 'U'], [Sign.V, 'V'], [Sign.W, 'W'], [Sign.X, 'X'], [Sign.Y, 'Y'],
  [Sign.Z, 'Z'],

  [Sign.D0, '0'], [Sign.D1, '1'], [Sign.D2, '2'], [Sign.D3, '3'],
  [Sign.D4, '4'], [Sign.D5, '5'], [Sign.D6, '6'], [Sign.D7, '7'],
  [Sign.D8, '8'], [Sign.D9, '9'],

  [Sign.SEMICOLON, ';'], [Sign.QUOTE, '"'], [Sign.COMMA, ','], [Sign.PROP, '→'],
  [Sign._, '_'], [Sign.SPACE, ' '],

  [Sign.AUX0, 'α'], [Sign.AUX1, 'β'], [Sign.AUX2, 'γ'], [Sign.AUX3, 'δ'],
  [Sign.AUX4, 'ε'], [Sign.AUX5, 'ζ'], [Sign.AUX6, 'η'], [Sign.AUX7, 'θ'],
  [Sign.AUX8, 'ι'], [Sign.AUX9, 'κ'], [PrintSign, 'λ'], [InputSign, 'μ'],

  [Sign.LT, '<'], [Sign.LE, '≤'], [Sign.EQ, '='], [Sign.NE, '≠'],
  [Sign.GE, '≥'], [Sign.GT, '>'],

  [Sign.PLUS, '+'], [Sign.MINUS, '-'], [Sign.MUL, '*'], [Sign.DIV, '/'],
  [Sign.MOD, '%'], [Sign.DOT, '.'],

  [Sign.NOT, '˜'], [Sign.OR, '|'], [Sign.AND, '∧'], [Sign.TRUE, '✓'],
  [Sign.FALSE, '✕'], [Sign.NONE, '☐'], [Sign.ASSIGN, '≔'],

  [Sign.LPAR, '('], [Sign.RPAR, ')'], [Sign.LBRA, '['], [Sign.RBRA, ']'],
  [Sign.LCURLY, '{'], [Sign.RCURLY, '}'],

  [Sign.IF, '☝'], [Sign.ELSE, '☞'], [Sign.WHILE, '⟳'], [Sign.FOR, '♶'],

  [Sign.CLASS, '⚛'], [Sign.FUNCTION, 'ƒ'], [Sign.RETURN, '⚹'],
  [Sign.CONTINUE, '⚺'], [Sign.BREAK, '⚻'],
])

export const charToSignMap: Map<string, Sign> = new Map()

for (const [key, value] of signToCharMap) {
  charToSignMap.set(value, key)
}

export function charToSign(str: string): Sign {
  if (charToSignMap.has(str)) {
    return charToSignMap.get(str) as Sign
  } else {
    throw new Error(`Unknown char ${str}`)
  }
}

export function stringSignToChar(str: string): string {
  if (signStrings.has(str)) {
    return signToCharMap.get(Sign[str as keyof typeof Sign]) as string
  } else {
    throw new Error(`Unknown sign "${str}"`)
  }
}
