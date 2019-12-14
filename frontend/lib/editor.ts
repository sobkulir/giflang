import { charToSign, signToCharMap } from '~/interpreter/ast/sign'
import { Text } from '../types/text-area'
import { LetterImp, LetterRowImp } from './text-area'

export function CharsToSigns(str: string): Text {
  const lines = str.split('\n')
  return lines.map(
    (line) => new LetterRowImp(
      line.split('').map((char) => new LetterImp(charToSign(char)))
    ))
}

export function SignsToChars(text: Text): string {
  return text.map(
    (row) => row.letters.map((letter) => signToCharMap.get(letter.sign))
      .join('')).join('\n')
}
