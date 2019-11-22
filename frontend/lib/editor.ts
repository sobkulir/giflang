import { Sign, Text } from '../types/text-area'
import { LetterImp, LetterRowImp } from './text-area'

export function SignsToTokens(text: Text): string {
  return text.map(
    (row) => row.letters.map((letter) => `${Sign[letter.sign]};`).join('')
  ).join('\n')
}

function SingleCharToSign(char: string): Sign {
  const c = char.charCodeAt(0)

  if ('A'.charCodeAt(0) <= c && c <= 'Z'.charCodeAt(0)) {
    return Sign[char as any] as unknown as Sign
  }
  if ('0'.charCodeAt(0) <= c && c <= '9'.charCodeAt(0)) {
    return Sign[`D${char}` as any] as unknown as Sign
  }

  if (char === ' ') {
    return Sign.SPACE
  } else if (char === '_') {
    return Sign._
  } else if (char === '.') {
    return Sign.DOT
  } else {
    throw new Error(`Cannot convert ${char} to Sign.`)
  }
}

export function CharsToSigns(str: string): Text {
  const lines = str.split('\n')
  return lines.map(
    (line) => new LetterRowImp(
      line.split('').map((char) => new LetterImp(SingleCharToSign(char))))
  )
}

const signCharMap: Map<Sign, string> = new Map([
  [Sign.A, 'A'], [Sign.B, 'B'], [Sign.C, 'C'], [Sign.D, 'D'], [Sign.E, 'E'],
  [Sign.F, 'F'], [Sign.G, 'G'], [Sign.H, 'H'], [Sign.I, 'I'], [Sign.J, 'J'],
  [Sign.K, 'K'], [Sign.L, 'L'], [Sign.M, 'M'], [Sign.N, 'N'], [Sign.O, 'O'],
  [Sign.P, 'P'], [Sign.Q, 'Q'], [Sign.R, 'R'], [Sign.S, 'S'], [Sign.T, 'T'],
  [Sign.U, 'U'], [Sign.V, 'V'], [Sign.W, 'W'], [Sign.X, 'X'], [Sign.Y, 'Y'],
  [Sign.Z, 'Z'],
  [Sign.D0, '0'], [Sign.D1, '1'], [Sign.D2, '2'], [Sign.D3, '3'],
  [Sign.D4, '4'], [Sign.D5, '5'], [Sign.D6, '6'], [Sign.D7, '7'],
  [Sign.D8, '8'], [Sign.D9, '9'],
  [Sign.SPACE, ' '], [Sign._, '_']
])

export function SignsToChars(text: Text): string {
  return text.map(
    (row) => row.letters.map((letter) => signCharMap.get(letter.sign))
      .join('')).join('\n')
}
