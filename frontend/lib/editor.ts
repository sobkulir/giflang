import { Text } from '../redux/editor/types'
import { Sign } from './sign'

function TextToString(text: Text): string {
  return text.map(
    (row) => row.letters.map((letter) => `${Sign[letter.sign]};`).join('')
  ).join('\n')
}

export { TextToString }

