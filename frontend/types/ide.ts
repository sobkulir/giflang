import { Sign } from './text-area'

export interface LetterSize {
  edgePx: number
  marginPx: number
}
export type AlphabetCategory = { name: string, signs: Sign[] }
export type CategorizedAlphabet = AlphabetCategory[]
export type FileName = string
export type SignToGifMap = Map<Sign, FileName>

export interface IDE {
  signToGifMap: SignToGifMap
  alphabet: CategorizedAlphabet
  letterSize: LetterSize
}
