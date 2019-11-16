import * as Comlink from 'comlink'
import produce from 'immer'
import Worker from 'worker-loader!~/interpreter/giflang.worker'
import { GiflangSetup, GiflangWorker } from '~/interpreter/giflang.worker'
import { storeInstance } from '../app'
import { CodeToString } from '../lib/editor'
import { RunState } from '../types/execution'
import { MyAction, State } from '../types/redux'

export const appendToOutput =
  (output: string): MyAction<string> => ({
    type: 'Append to output',
    payload: output,
    reducer: produce((state: State) => {
      state.execution.output += output
    })
  })

export const finishExecution =
  (): MyAction<void> => ({
    type: 'Execution finished',
    reducer: produce((state: State) => {
      state.execution.runState = RunState.NOT_RUNNING
      const worker = state.execution.worker
      if (worker !== null) {
        worker.terminate()
      }
      state.execution.worker = null
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
    state.execution.runState = RunState.DEBUG_WAITING
    state.execution.resolveNextStep = args.resolveNextStep
    state.execution.lineno = args.lineno
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
    reducer: produce((state: State) => {
      state.execution.runState = RunState.STARTING
      state.execution.output = ''
      StartExecution(CodeToString(state.editor.text), isDebugMode)
    })
  })
