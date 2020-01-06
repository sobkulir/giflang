import { charToSign, signToCharMap } from '~/interpreter/ast/sign'
import { Text as ImageText } from '../types/text-area'
import { LetterImp, LetterRowImp } from './text-area'

export function CharsToImageText(str: string): ImageText {
  const lines = str.split('\n')
  return lines.map(
    (line) => new LetterRowImp(
      line.split('').map((char) => new LetterImp(charToSign(char)))
    ))
}

export function ImageTextToChars(text: ImageText): string {
  return text.map(
    (row) => row.letters.map((letter) => signToCharMap.get(letter.sign))
      .join('')).join('\n')
}
