import * as Comlink from 'comlink'
import { produce } from 'immer'
import Worker from 'worker-loader!~/interpreter/giflang.worker.ts'
import { GiflangSetup, GiflangWorker } from '~/interpreter/giflang.worker'
import { storeInstance } from '../../app'
import { CodeToString } from '../../lib/editor'
import { Sign } from '../../lib/sign'
import { LetterImp, LetterRowImp, MoveCursorDown, MoveCursorLeft, MoveCursorRight, MoveCursorUp, PositionPixelsToRowCol, TrimPositionRowCol } from '../../lib/text-area'
import { MyAction, State } from '../types'
import { PositionPixels, RunState } from './types'

export const setCursorPosition =
  (positionPixels: PositionPixels): MyAction<PositionPixels> => ({
    type: 'Set cursor position',
    payload: positionPixels,
    reducer: produce((state: State) => {
      const positionRowCol =
        TrimPositionRowCol(
          PositionPixelsToRowCol(state.editor.letterSize, positionPixels),
          state.editor.text)
      state.editor.cursorPosition = positionRowCol
    })
  })

export const addSignAfterCursor =
  (sign: Sign): MyAction<Sign> => ({
    type: 'Add sign after cursor',
    payload: sign,
    reducer: produce((state: State) => {
      const position = state.editor.cursorPosition
      state.editor.text[position.row].letters
        .splice(position.col, 0, new LetterImp(sign))
      state.editor.cursorPosition =
        MoveCursorRight(position, state.editor.text)
    })
  })

export enum Direction { UP, RIGHT, DOWN, LEFT }

export const moveCursor =
  (direction: Direction): MyAction<Direction> => ({
    type: 'Move cursor',
    payload: direction,
    reducer: produce((state: State) => {
      const position = state.editor.cursorPosition
      const text = state.editor.text
      switch (direction) {
        case Direction.RIGHT:
          state.editor.cursorPosition = MoveCursorRight(position, text)
          break
        case Direction.DOWN:
          state.editor.cursorPosition = MoveCursorDown(position, text)
          break
        case Direction.LEFT:
          state.editor.cursorPosition = MoveCursorLeft(position, text)
          break
        case Direction.UP:
          state.editor.cursorPosition = MoveCursorUp(position, text)
          break
      }
    })
  })

export const removeAfterCursor =
  (): MyAction<void> => ({
    type: 'Remove after cursor',
    reducer: produce((state: State) => {
      const { row, col } = state.editor.cursorPosition
      const text = state.editor.text
      if (col < text[row].letters.length) {
        text[row].letters.splice(col, 1)
      } else {
        if (row + 1 < text.length) {
          text[row].letters.push(...text[row + 1].letters)
          text.splice(row + 1, 1)
        }
      }
    })
  })

export const newlineAfterCursor =
  (): MyAction<void> => ({
    type: 'Newline after cursor',
    reducer: produce((state: State) => {
      const { row, col } = state.editor.cursorPosition
      const text = state.editor.text
      const newRow = new LetterRowImp(text[row].letters.slice(col))
      text[row].letters.splice(col)
      text.splice(row + 1, 0, newRow)
      state.editor.cursorPosition =
        MoveCursorRight(state.editor.cursorPosition, state.editor.text)
    })
  })

export const appendToOutput =
  (output: string): MyAction<string> => ({
    type: 'Append to output',
    payload: output,
    reducer: produce((state: State) => {
      state.editor.execution.output += output
    })
  })

export const finishExecution =
  (): MyAction<void> => ({
    type: 'Execution finished',
    reducer: produce((state: State) => {
      state.editor.execution.state = RunState.NOT_RUNNING
      const worker = state.editor.execution.worker
      if (worker !== null) {
        worker.terminate()
      }
      state.editor.execution.worker = null
    })
  })

export type NextStepArgs = {
  resolveNextStep: () => void,
  lineno: number
}

export const newNextStep =
(args: NextStepArgs): MyAction<NextStepArgs> => ({
  type: 'New next step',
  payload: args,
  reducer: produce((state: State) => {
    state.editor.execution.state = RunState.DEBUG_WAITING
    state.editor.execution.resolveNextStep = args.resolveNextStep
    state.editor.execution.lineno = args.lineno
  })
})


export const giflangSetup: GiflangSetup = {
  onPrint:
    (str: string) => { storeInstance.dispatch(appendToOutput(str))},
  onFinish:
    (_err: string | undefined) =>
      { storeInstance.dispatch(finishExecution())},
  onNextStep:
    (lineno: number) => {
      let resolveNextStep: any
      const ret = new Promise<void>((resolve, _) => resolveNextStep = resolve)
      storeInstance.dispatch(newNextStep({resolveNextStep, lineno}))
      return ret
    }
  }

export const executionStarted =
  (worker: Worker, isDebugMode: boolean): MyAction<Worker> => ({
    type: 'Execution started',
    reducer: produce((state: State) => {
      state.editor.execution.state = 
        (isDebugMode) ? RunState.DEBUG_RUNNING : RunState.RUNNING
      state.editor.execution.worker = worker
    })
  })

export async function StartExecution(code: string, isDebugMode: boolean) {
  const vanillaWorker = new Worker()
  const workerProxy =
    Comlink.wrap<
      new (giflangSetup: GiflangSetup,
        isDebugMode: boolean) => Promise<GiflangWorker>
    >(vanillaWorker)

  const worker = await new workerProxy(
    Comlink.proxy(giflangSetup), isDebugMode)
  storeInstance.dispatch(executionStarted(vanillaWorker, isDebugMode))
  worker.run(code)
}

export const startExecution =
  (isDebugMode: boolean): MyAction<boolean> => ({
    type: 'Start execution',
    reducer: produce((state: State) => {
      state.editor.execution.state = RunState.STARTING
      state.editor.execution.output = ''
      StartExecution(CodeToString(state.editor.text), isDebugMode)
    })
  })
