import produce from 'immer'
import { charToSign, Sign } from '~/interpreter/ast/sign'
import { LetterImp, LetterRowImp, MoveCursorDown, MoveCursorLeft, MoveCursorRight, MoveCursorUp, PositionPixelsToRowCol, TrimPositionRowCol } from '../lib/text-area'
import { FocusedArea } from '../types/ide'
import { MyAction, State } from '../types/redux'
import { createEmptyText, PositionPixels, ScrollableType, TextArea, TextAreaType } from '../types/text-area'

export const setText =
  (areaType: TextAreaType, text: string)
    : MyAction<string> => ({
      type: 'Set cursor position',
      payload: text,
      reducer: produce((state: State) => {
        state.textAreaMap[areaType].text = text.split('\n').map((line) =>
          new LetterRowImp(line.split('').map((char) =>
            new LetterImp(charToSign(char)))))
      })
    })

export const setCursorPosition =
  (areaType: TextAreaType, positionPixels: PositionPixels)
    : MyAction<PositionPixels> => ({
      type: 'Set cursor position',
      payload: positionPixels,
      reducer: produce((state: State) => {
        const area = state.textAreaMap[areaType]
        const positionRowCol =
          TrimPositionRowCol(
            PositionPixelsToRowCol(state.ide.letterSize, positionPixels),
            area.text)
        area.cursorPosition = positionRowCol
        state.textAreaMap[areaType].scroll = ScrollableType.CURSOR
      })
    })

function addSignAfterCursorImp(area: TextArea, sign: Sign) {
  const position = area.cursorPosition
  if (area.text.length === 0) area.text = createEmptyText()

  area.text[position.row].letters
    .splice(position.col, 0, new LetterImp(sign))
  area.cursorPosition = MoveCursorRight(position, area.text)
  area.scroll = ScrollableType.CURSOR
}

export const addSignAfterCursor =
  (areaType: TextAreaType, sign: Sign): MyAction<Sign> => ({
    type: 'Add sign after cursor',
    payload: sign,
    reducer: produce((state: State) => {
      addSignAfterCursorImp(state.textAreaMap[areaType], sign)
    })
  })

export const addSignAfterFocusedCursor =
  (sign: Sign): MyAction<Sign> => ({
    type: 'Add sign after cursor',
    payload: sign,
    reducer: produce((state: State) => {
      let areaType: TextAreaType
      switch (state.ide.focusedArea) {
        case FocusedArea.EXECUTION_INPUT:
          areaType = TextAreaType.EXECUTION_INPUT; break
        case FocusedArea.MAIN_EDITOR:
          areaType = TextAreaType.MAIN_EDITOR; break
        default:
          return
      }
      addSignAfterCursorImp(state.textAreaMap[areaType], sign)
    })
  })

export enum Direction { UP, RIGHT, DOWN, LEFT }

export const moveCursor =
  (areaType: TextAreaType, direction: Direction): MyAction<Direction> => ({
    type: 'Move cursor',
    payload: direction,
    reducer: produce((state: State) => {
      const area = state.textAreaMap[areaType]
      const position = state.textAreaMap[areaType].cursorPosition
      const text = state.textAreaMap[areaType].text
      switch (direction) {
        case Direction.RIGHT:
          area.cursorPosition = MoveCursorRight(position, text)
          break
        case Direction.DOWN:
          area.cursorPosition = MoveCursorDown(position, text)
          break
        case Direction.LEFT:
          area.cursorPosition = MoveCursorLeft(position, text)
          break
        case Direction.UP:
          area.cursorPosition = MoveCursorUp(position, text)
          break
      }
      state.textAreaMap[areaType].scroll = ScrollableType.CURSOR
    })
  })

export const removeAfterCursor =
  (areaType: TextAreaType): MyAction<void> => ({
    type: 'Remove after cursor',
    reducer: produce((state: State) => {
      const { row, col } = state.textAreaMap[areaType].cursorPosition
      const text = state.textAreaMap[areaType].text
      if (col < text[row].letters.length) {
        text[row].letters.splice(col, 1)
      } else {
        if (row + 1 < text.length) {
          text[row].letters.push(...text[row + 1].letters)
          text.splice(row + 1, 1)
        }
      }
      state.textAreaMap[areaType].scroll = ScrollableType.CURSOR
    })
  })

export const newlineAfterCursor =
  (areaType: TextAreaType): MyAction<void> => ({
    type: 'Newline after cursor',
    reducer: produce((state: State) => {
      const area = state.textAreaMap[areaType]
      const text = area.text
      const { row, col } = area.cursorPosition
      const newRow = new LetterRowImp(text[row].letters.slice(col))
      text[row].letters.splice(col)
      text.splice(row + 1, 0, newRow)
      area.cursorPosition = MoveCursorRight(area.cursorPosition, area.text)
      state.textAreaMap[areaType].scroll = ScrollableType.CURSOR
    })
  })

export const scrollToType =
  (areaType: TextAreaType, scrollType: ScrollableType)
    : MyAction<ScrollableType> => ({
      type: 'Scroll',
      payload: scrollType,
      reducer: produce((state: State) => {
        state.textAreaMap[areaType].scroll = scrollType
      })
    })
