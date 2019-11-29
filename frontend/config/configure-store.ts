import { AnyAction, applyMiddleware, createStore } from 'redux'
import thunk, { ThunkMiddleware } from 'redux-thunk'
import { Sign } from '~/interpreter/ast/sign'
import { InputBuffer } from '../lib/input-buffer'
import { LetterImp, LetterRowImp } from '../lib/text-area'
import { createDefaultLocator, RunState } from '../types/execution'
import { FocusedArea, LoadingBarState } from '../types/ide'
import { MyAction, State } from '../types/redux'
import { LoadState, SaveState } from '../types/storage'
import { createEmptyText, ScrollableType } from '../types/text-area'

const getInitialState = (): State => (
  {
    textAreaMap: {
      mainEditor: {
        cursorPosition: { row: 0, col: 0 },
        text: [
          new LetterRowImp([new LetterImp(Sign.X), new LetterImp(Sign.ASSIGN), new LetterImp(Sign.D8), new LetterImp(Sign.SEMICOLON)]),
          new LetterRowImp([new LetterImp(Sign.P), new LetterImp(Sign.R), new LetterImp(Sign.I), new LetterImp(Sign.N), new LetterImp(Sign.T), new LetterImp(Sign.LPAR), new LetterImp(Sign.D8), new LetterImp(Sign.RPAR), new LetterImp(Sign.SEMICOLON)]),
        ],
        scroll: ScrollableType.NONE
      },
      executionInput: {
        cursorPosition: { row: 0, col: 0 },
        text: createEmptyText(),
        scroll: ScrollableType.NONE
      }
    },
    execution: {
      runState: RunState.NOT_RUNNING,
      output: [],
      locator: createDefaultLocator(),
      callStack: [],
      environment: [],
      commitedInput: [],
      inputBuffer: new InputBuffer<string>([]),
      worker: null,
      errorMsg: '',
      resolveNextStep: () => { return },
    },
    ide: {
      loadingBarState: LoadingBarState.IDLE,
      signToGifMap: new Map(
        (Object.keys(Sign).map((key) => Sign[key as any])
          .filter((value) => typeof value === 'string') as string[])
          .map((key) =>
            [
              Sign[key as any] as unknown as Sign,
              `/img/${key}.webp`
            ])
      ),
      alphabet: [
        { name: 'Auxletters', signs: [Sign.AUX0, Sign.AUX1, Sign.AUX2, Sign.AUX3, Sign.AUX4, Sign.AUX5, Sign.AUX6, Sign.AUX7, Sign.AUX8, Sign.AUX9] },
        { name: 'Comparisons', signs: [Sign.LT, Sign.LE, Sign.EQ, Sign.NE, Sign.GE, Sign.GT] },
        { name: 'Arithmetics', signs: [Sign.PLUS, Sign.MINUS, Sign.MUL, Sign.DIV, Sign.MOD, Sign.DOT] },
        { name: 'Booleans', signs: [Sign.TRUE, Sign.FALSE, Sign.AND, Sign.OR, Sign.NOT] },
        { name: 'Variables', signs: [Sign.ASSIGN, Sign.NONE] },
        { name: 'Flow', signs: [Sign.IF, Sign.ELSE, Sign.WHILE, Sign.FOR, Sign.BREAK, Sign.CONTINUE] },
        { name: 'Classes and functions', signs: [Sign.CLASS, Sign.PROP, Sign.FUNCTION, Sign.RETURN] }
      ],
      letterSize: { edgePx: 80, marginPx: 6 },
      focusedArea: FocusedArea.MAIN_EDITOR
    },
    storage: {
      loadState: LoadState.INITIAL,
      saveState: SaveState.SAVED
    }
  })

const rootReducer = (
  state: State = getInitialState(),
  action: MyAction<any>) => {
  // Fallback for unknown actions.
  if (!action.reducer) return state
  else return action.reducer(state)
}

export const configureStore = () =>
  createStore(
    rootReducer,
    getInitialState(),
    applyMiddleware(thunk as ThunkMiddleware<State, AnyAction>))
