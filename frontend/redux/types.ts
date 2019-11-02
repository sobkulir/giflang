import { EditorState } from './editor/types'

interface State {
  readonly editor: EditorState
}

// "My" prefix is used to distinguish this interface from "Action" interface
// found in redux.
interface MyAction<Payload = undefined> {
  type: string
  payload?: Payload
  reducer: (state: State) => State
}

export { State, MyAction }

