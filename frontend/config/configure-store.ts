import { createStore } from 'redux'
import { LetterImp, LetterRowImp } from '../lib/text-area'
import { Sign } from '../types/editor'
import { RunState } from '../types/execution'
import { MyAction, State } from '../types/redux'


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
      { name: 'Booleans', signs: [Sign.TRUE, Sign.FALSE, Sign.AND, Sign.OR, Sign.NOT] },
      { name: 'Variables', signs: [Sign.ASSIGN, Sign.NONE] },
      { name: 'Flow', signs: [Sign.IF, Sign.ELSE, Sign.WHILE, Sign.FOR, Sign.BREAK, Sign.CONTINUE] },
      { name: 'Classes and functions', signs: [Sign.CLASS, Sign.PROP, Sign.FUNCTION, Sign.RETURN] }
      ],
      text: [
        new LetterRowImp([new LetterImp(Sign.X), new LetterImp(Sign.ASSIGN), new LetterImp(Sign.D8), new LetterImp(Sign.SEMICOLON)]),
        new LetterRowImp([new LetterImp(Sign.P), new LetterImp(Sign.R), new LetterImp(Sign.I), new LetterImp(Sign.N), new LetterImp(Sign.T), new LetterImp(Sign.LPAR), new LetterImp(Sign.D8), new LetterImp(Sign.RPAR), new LetterImp(Sign.SEMICOLON)]),
      ],
    },
    execution: {
      runState: RunState.NOT_RUNNING,
      output: '',
      worker: null,
      resolveNextStep: () => { return },
      lineno: 0,
    }
  })

const rootReducer = (
  state: State = getInitialState(),
  action: MyAction<any>) => {
  // Fallback for unknown actions.
  if (!action.reducer) return state
  else return action.reducer(state)
}

export const configureStore = () => createStore(rootReducer, getInitialState())