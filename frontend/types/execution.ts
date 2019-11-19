import { JisonLocator } from '~/interpreter/ast/ast-node'
import { InputBuffer } from '../lib/input-buffer'
import { Text } from './text-area'

export enum RunState {
  STARTING, RUNNING, DEBUG_WAITING, DEBUG_RUNNING, NOT_RUNNING
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
  inputBuffer: InputBuffer<string>
  commitedInput: Text
  worker: Worker | null
  resolveNextStep: () => void
}
