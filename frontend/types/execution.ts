export enum RunState {
  STARTING, RUNNING, DEBUG_WAITING, DEBUG_RUNNING, NOT_RUNNING
}

export interface ExecutionState {
  runState: RunState
  output: string
  worker: Worker | null
  resolveNextStep: () => void
  lineno: number
}
