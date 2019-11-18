import { InputBuffer } from '../lib/input-buffer'
import { Text } from './text-area'

export enum RunState {
  STARTING, RUNNING, DEBUG_WAITING, DEBUG_RUNNING, NOT_RUNNING
}

export interface ExecutionState {
  runState: RunState
  output: Text
  inputBuffer: InputBuffer<string>
  commitedInput: Text
  worker: Worker | null
  resolveNextStep: () => void
  lineno: number
}
