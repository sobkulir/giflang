import * as Comlink from 'comlink'
import produce from 'immer'
import Worker from 'worker-loader!~/interpreter/giflang.worker'
import { JisonLocator } from '~/interpreter/ast/ast-node'
import { InputBarrier, SteppingBarrier } from '~/interpreter/barrier'
import { SerializedEnvironment } from '~/interpreter/environment'
import { GiflangBuffers, GiflangClbks, GiflangWorker } from '~/interpreter/giflang.worker'
import { CallStack } from '~/interpreter/interpreter'
import { storeInstance } from '../app'
import { CharsToImageText, ImageTextToChars } from '../lib/editor'
import { InputBuffer } from '../lib/input-buffer'
import { RunState } from '../types/execution'
import { FocusedArea } from '../types/ide'
import { MyAction, State } from '../types/redux'
import { createEmptyText, ScrollableType } from '../types/text-area'

export const appendToOutput =
  (output: string): MyAction<string> => ({
    type: 'Append to output',
    payload: output,
    reducer: produce((state: State) => {
      if (output === '') return
      const newSigns = CharsToImageText(output)
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
  (errorMsg: string): MyAction<string> => ({
    type: 'Execution finished',
    reducer: produce((state: State) => {
      state.execution.runState = RunState.NOT_RUNNING
      state.execution.errorMsg = errorMsg
      state.execution.worker!.terminate()
      state.execution.worker = null
    })
  })

export type NextStepArgs = {
  locator: JisonLocator,
  callStack: CallStack,
  environment: SerializedEnvironment
}

export const newNextStep =
(args: NextStepArgs): MyAction<NextStepArgs> => ({
  type: 'New next step',
  payload: args,
  reducer: produce((state: State) => {
    state.execution.runState = RunState.DEBUG_WAITING
    state.execution.locator = args.locator
    state.execution.callStack = args.callStack
    state.execution.environment = args.environment
    state.textAreaMap.mainEditor.scroll = ScrollableType.HIGHLIGHT
  })
})

function createGiflangSetup():
  {clbks: GiflangClbks, buffers: GiflangBuffers} {
  const stepperBarrier = new SteppingBarrier()
  const inputBarrier = new InputBarrier()
  return {
    clbks: {
      onPrint:
        (str: string) => { storeInstance.dispatch(appendToOutput(str))},
      onFinish:
        (errorMsg: string) =>
          { storeInstance.dispatch(finishExecution(errorMsg))},
      onNextStep:
        (locator: JisonLocator,
          callStack: CallStack, environment: SerializedEnvironment) => {
          storeInstance.dispatch(newNextStep(
            {locator, callStack, environment}))
        },
      onInput:
        async () => {
          inputBarrier.notify(
            await storeInstance.getState().execution.inputBuffer.popFront())
        },
    },
    buffers: {
      inputChars: inputBarrier.charBuffer,
      inputSize: inputBarrier.sizeBuffer,
      stepperFlag: stepperBarrier.flagBuffer
    }
  }
}

export const executionStarted =
  (resolveNextStep: () => void, worker: Worker, isDebugMode: boolean)
    : MyAction<Worker> => ({
    type: 'Execution started',
    reducer: produce((state: State) => {
      state.execution.runState = 
        (isDebugMode) ? RunState.DEBUG_RUNNING : RunState.RUNNING
      state.execution.worker = worker
      state.execution.locator = undefined
      state.execution.resolveNextStep = resolveNextStep
      state.ide.focusedArea = FocusedArea.EXECUTION_INPUT
      state.ide.isIOBoxVisible = true
    })
  })

async function StartWorker(code: string, isDebugMode: boolean) {
  const vanillaWorker = new Worker()
  const workerProxy =
    Comlink.wrap<
      new (clbks: GiflangClbks, buffers: GiflangBuffers,
        isDebugMode: boolean) => Promise<GiflangWorker>
    >(vanillaWorker)

  const setup = createGiflangSetup()
  const worker = await new workerProxy(
    Comlink.proxy(setup.clbks), setup.buffers, isDebugMode)

  const stepperBarrier = new SteppingBarrier(setup.buffers.stepperFlag)
  storeInstance.dispatch(executionStarted(
    () => stepperBarrier.notify(), vanillaWorker, isDebugMode))
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
      execution.committedInput = []
      execution.inputBuffer = new InputBuffer<string>([])
      execution.errorMsg = ''
      state.textAreaMap.executionInput.text = createEmptyText()
      state.textAreaMap.executionInput.cursorPosition = {row: 0, col: 0}
      StartWorker(
        ImageTextToChars(state.textAreaMap.mainEditor.text),
        isDebugMode)
    })
  })

export const addLineToInput =
  (): MyAction<void> => ({
    type: 'Add line to input',
    reducer: produce((state: State) => {
      const executionInput = state.textAreaMap.executionInput
      state.execution.committedInput.push(executionInput.text[0])
      state.execution.inputBuffer.push(ImageTextToChars(executionInput.text))
      executionInput.text = createEmptyText()
      executionInput.cursorPosition = {row: 0, col: 0}
      state.textAreaMap.executionInput.scroll = ScrollableType.CURSOR
    })
  })
