import { createStore } from 'redux'
import { Sign } from '../lib/sign'
import { LetterImp, LetterRowImp } from '../lib/text-area'
import { MyAction, State } from './types'

const getInitialState = (): State => (
  {
    editor: {
      cursorPosition: { row: 0, col: 0 },
      letterSize: { edgePx: 80, marginPx: 6 },
      signToGifMap: new Map(

        (Object.keys(Sign).map((key) => Sign[key as any])
          .filter((value) => typeof value === 'string') as string[])
          .map((key) =>
            [
              Sign[key as any] as unknown as Sign,
              `/img/${key}.webp`
            ])
      ),
      alphabet: [{ name: 'Comparisons', signs: [Sign.LT, Sign.LE, Sign.EQ, Sign.NE, Sign.GE, Sign.GT] },
      { name: 'Arithmetics', signs: [Sign.PLUS, Sign.MINUS, Sign.MUL, Sign.DIV, Sign.MOD] },
      { name: 'Booleans', signs: [Sign.TRUE, Sign.FALSE, Sign.AND, Sign.OR, Sign.NOT] }
      ],
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

