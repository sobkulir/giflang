import { Text } from './editor'

export enum RunState {
  STARTING, RUNNING, DEBUG_WAITING, DEBUG_RUNNING, NOT_RUNNING
}

export interface ExecutionState {
  runState: RunState
  output: Text
  worker: Worker | null
  resolveNextStep: () => void
  lineno: number
}
