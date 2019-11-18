import { ExecutionState } from './execution'
import { IDE } from './ide'
import { TextAreaMap } from './text-area'

export interface State {
  readonly textAreaMap: TextAreaMap
  readonly execution: ExecutionState
  readonly ide: IDE
}

// "My" prefix is used to distinguish this interface from "Action" interface
// found in redux.
export interface MyAction<Payload = undefined> {
  type: string
  payload?: Payload
  reducer: (state: State) => State
}
