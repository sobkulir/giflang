import { Sign, Text } from '../types/editor'
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


