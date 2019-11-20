import { JisonLocator } from '~/interpreter/ast/ast-node'
import { SerializedEnvironment } from '~/interpreter/environment'
import { CallStack } from '~/interpreter/interpreter'
import { InputBuffer } from '../lib/input-buffer'
import { Text } from './text-area'

export enum RunState {
  STARTING, RUNNING, DEBUG_WAITING, DEBUG_RUNNING, NOT_RUNNING
}

export function isDebugMode(runState: RunState) {
  return (runState === RunState.DEBUG_RUNNING
    || runState === RunState.DEBUG_WAITING)
}

export const createDefaultLocator = (): JisonLocator => ({
  first_line: 0,
  first_column: 0,
  last_line: 0,
  last_column: 0
})

export interface ExecutionState {
  runState: RunState
  output: Text
  locator: JisonLocator
  callStack: CallStack
  environment: SerializedEnvironment
  inputBuffer: InputBuffer<string>
  commitedInput: Text
  worker: Worker | null
  resolveNextStep: () => void
}
