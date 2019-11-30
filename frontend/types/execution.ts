import { JisonLocator } from '~/interpreter/ast/ast-node'
import { SerializedEnvironment } from '~/interpreter/environment'
import { CallStack } from '~/interpreter/interpreter'
import { InputBuffer } from '../lib/input-buffer'
import { Text } from './text-area'

export enum RunState {
  STARTING, RUNNING, DEBUG_WAITING, DEBUG_RUNNING, NOT_RUNNING
}

export function isDebugMode(runState: RunState) {
  return [RunState.DEBUG_RUNNING, RunState.DEBUG_WAITING].includes(runState)
}

export interface ExecutionState {
  runState: RunState
  output: Text
  locator?: JisonLocator
  callStack: CallStack
  environment: SerializedEnvironment
  inputBuffer: InputBuffer<string>
  commitedInput: Text
  errorMsg: string
  worker: Worker | null
  resolveNextStep: () => void
}
