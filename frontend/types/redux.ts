import { EditorState } from './editor'
import { ExecutionState } from './execution'

export interface State {
  readonly editor: EditorState
  readonly execution: ExecutionState
}

// "My" prefix is used to distinguish this interface from "Action" interface
// found in redux.
export interface MyAction<Payload = undefined> {
  type: string
  payload?: Payload
  reducer: (state: State) => State
}
