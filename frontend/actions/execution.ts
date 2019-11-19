import * as Comlink from 'comlink'
import produce from 'immer'
import Worker from 'worker-loader!~/interpreter/giflang.worker'
import { JisonLocator } from '~/interpreter/ast/ast-node'
import { GiflangSetup, GiflangWorker } from '~/interpreter/giflang.worker'
import { storeInstance } from '../app'
import { CharsToSigns, SignsToChars, SignsToTokens } from '../lib/editor'
import { RunState } from '../types/execution'
import { MyAction, State } from '../types/redux'
import { createEmptyText, ScrollableType } from '../types/text-area'

export const appendToOutput =
  (output: string): MyAction<string> => ({
    type: 'Append to output',
    payload: output,
    reducer: produce((state: State) => {
      if (output === '') return
      const newSigns = CharsToSigns(output)
      if (state.execution.output.length === 0) {
        state.execution.output = newSigns
      } else {
        const firstLine = newSigns.slice(0, 1)[0]
        const rest = newSigns.slice(1)
        state.execution.output[state.execution.output.length - 1]
          .letters.push(...firstLine.letters)
        state.execution.output.push(...rest)
      }

    })
  })

export const finishExecution =
  (): MyAction<void> => ({
    type: 'Execution finished',
    reducer: produce((state: State) => {
      state.execution.runState = RunState.NOT_RUNNING
      state.execution.worker!.terminate()
      state.execution.worker = null
    })
  })

export type NextStepArgs = {
  resolveNextStep: () => void,
  locator: JisonLocator
}

export const newNextStep =
(args: NextStepArgs): MyAction<NextStepArgs> => ({
  type: 'New next step',
  payload: args,
  reducer: produce((state: State) => {
    state.execution.runState = RunState.DEBUG_WAITING
    state.execution.resolveNextStep = args.resolveNextStep
    state.execution.locator = args.locator
    state.textAreaMap.mainEditor.scroll = ScrollableType.HIGHLIGHT
  })
})

export const giflangSetup: GiflangSetup = {
  onPrint:
    (str: string) => { storeInstance.dispatch(appendToOutput(str))},
  onInput:
    () => {
      return storeInstance.getState().execution.inputBuffer.popFront()
    },
  onFinish:
    (_err: string | undefined) =>
      { storeInstance.dispatch(finishExecution())},
  onNextStep:
    (locator: JisonLocator) => {
      let resolveNextStep: any
      const ret = new Promise<void>((resolve, _) => resolveNextStep = resolve)
      storeInstance.dispatch(newNextStep({resolveNextStep, locator}))
      return ret
    }
  }

export const executionStarted =
  (worker: Worker, isDebugMode: boolean): MyAction<Worker> => ({
    type: 'Execution started',
    reducer: produce((state: State) => {
      state.execution.runState = 
        (isDebugMode) ? RunState.DEBUG_RUNNING : RunState.RUNNING
      state.execution.worker = worker
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
    payload: isDebugMode,
    reducer: produce((state: State) => {
      const execution = state.execution
      execution.runState = RunState.STARTING
      execution.output = []
      execution.commitedInput = []
      state.textAreaMap.executionInput.text = createEmptyText()
      state.textAreaMap.executionInput.cursorPosition = {row: 0, col: 0}
      StartExecution(
        SignsToTokens(state.textAreaMap.mainEditor.text),
        isDebugMode)
    })
  })

export const addLineToInput =
  (): MyAction<void> => ({
    type: 'Add line to input',
    reducer: produce((state: State) => {
      const executionInput = state.textAreaMap.executionInput
      state.execution.commitedInput.push(executionInput.text[0])
      state.execution.inputBuffer.push(SignsToChars(executionInput.text))
      executionInput.text = createEmptyText()
      executionInput.cursorPosition = {row: 0, col: 0}
    })
  })
