import { Sign } from '~/interpreter/ast/sign'

export interface LetterSize {
  edgePx: number
  marginPx: number
}
export type AlphabetCategory = { name: string, signs: Sign[] }
export type CategorizedAlphabet = AlphabetCategory[]
export type FileName = string
export type SignToGifMap = Map<Sign, FileName>

export enum FocusedArea {
  MAIN_EDITOR, EXECUTION_INPUT, UNKNOWN
}

export enum LoadingBarState {
  START, IN_PROGRESS, COMPLETE, IDLE
}

export interface IDE {
  signToGifMap: SignToGifMap
  alphabet: CategorizedAlphabet
  letterSize: LetterSize
  loadingBarState: LoadingBarState
  focusedArea: FocusedArea
  isIOBoxVisible: boolean
}
