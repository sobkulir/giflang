import { EditorState } from './editor/types'

export interface State {
  readonly editor: EditorState
}

// "My" prefix is used to distinguish this interface from "Action" interface
// found in redux.
export interface MyAction<Payload = undefined> {
  type: string
  payload?: Payload
  reducer: (state: State) => State
}
