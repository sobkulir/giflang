import { createStore } from 'redux'
import { LetterImp, LetterRowImp } from '../lib/editor'
import { Sign } from './editor/sign'
import { MyAction, State } from './types'

const getInitialState = (): State => (
  {
    editor: {
      cursorPosition: { row: 0, col: 0 },
      letterSize: { edgePx: 90, marginPx: 6 },
      signToGifMap: new Map(

        (Object.keys(Sign).map((key) => Sign[key as any])
          .filter((value) => typeof value === 'string') as string[])
          .map((key) => [Sign[key as any] as unknown as Sign, `${key}.webp`])
      ),
      text: [
        new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B)]),
        new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]), new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]), new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]), new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]), new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]), new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]), new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]), new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]), new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]), new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]), new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]), new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]), new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
        // new LetterRowImp([new LetterImp(Sign.A), new LetterImp(Sign.B), new LetterImp(Sign.A), new LetterImp(Sign.A), new LetterImp(Sign.A)]),
      ]
    }
  })

const rootReducer = (state: State = getInitialState(), action: MyAction) => {
  // Fallback for unknown actions.
  if (!action.reducer) return state
  const newState = action.reducer(state)
  console.log(state)
  console.log(newState)
  console.log(state.editor.text === newState.editor.text)
  return newState
}


const configureStore = () => createStore(rootReducer, getInitialState())

export { configureStore }

