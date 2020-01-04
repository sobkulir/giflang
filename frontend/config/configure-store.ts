import { AnyAction, applyMiddleware, createStore } from 'redux'
import thunk, { ThunkMiddleware } from 'redux-thunk'
import { InputSign, PrintSign, Sign } from '~/interpreter/ast/sign'
import { InputBuffer } from '../lib/input-buffer'
import { LetterImp, LetterRowImp } from '../lib/text-area'
import { RunState } from '../types/execution'
import { FocusedArea, LoadingBarState } from '../types/ide'
import { MyAction, State } from '../types/redux'
import { LoadState } from '../types/storage'
import { createEmptyText, ScrollableType } from '../types/text-area'

const getInitialState = (): State => (
  {
    textAreaMap: {
      mainEditor: {
        cursorPosition: { row: 0, col: 0 },
        text: [
          new LetterRowImp([new LetterImp(Sign.X), new LetterImp(Sign.ASSIGN), new LetterImp(Sign.D8), new LetterImp(Sign.SEMICOLON)]),
          new LetterRowImp([new LetterImp(Sign.AUX10), new LetterImp(Sign.LPAR), new LetterImp(Sign.D8), new LetterImp(Sign.RPAR), new LetterImp(Sign.SEMICOLON)]),
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
      locator: undefined,
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
        {
          name: 'Letters', signs: [
            { sign: PrintSign, label: 'print' },
            { sign: InputSign, label: 'input' },
            { sign: Sign.NONE, label: 'none' },
            { sign: Sign.TRUE, label: 'true' },
            { sign: Sign.FALSE, label: 'false' },
            { sign: Sign.AUX0, label: 'Aux0' },
            { sign: Sign.AUX1, label: 'Aux1' },
            { sign: Sign.AUX2, label: 'Aux2' },
            { sign: Sign.AUX3, label: 'Aux3' },
            { sign: Sign.AUX4, label: 'Aux4' },
            { sign: Sign.AUX5, label: 'Aux5' },
            { sign: Sign.AUX6, label: 'Aux6' },
            { sign: Sign.AUX7, label: 'Aux7' },
            { sign: Sign.AUX8, label: 'Aux8' },
            { sign: Sign.AUX9, label: 'Aux9' }]
        },
        {
          name: 'Comparisons', signs: [
            { sign: Sign.LT, label: '<' },
            { sign: Sign.LE, label: '<=' },
            { sign: Sign.EQ, label: '==' },
            { sign: Sign.NE, label: '!=' },
            { sign: Sign.GE, label: '>=' },
            { sign: Sign.GT, label: '>' }]
        },
        {
          name: 'Arithmetics', signs: [
            { sign: Sign.ASSIGN, label: ':=' },
            { sign: Sign.PLUS, label: '+' },
            { sign: Sign.MINUS, label: '-' },
            { sign: Sign.MUL, label: '*' },
            { sign: Sign.DIV, label: '/' },
            { sign: Sign.MOD, label: '%' },
            { sign: Sign.DOT, label: 'Decimal point' }]
        },
        {
          name: 'Booleans', signs: [
            { sign: Sign.AND, label: 'and' },
            { sign: Sign.OR, label: 'or' },
            { sign: Sign.NOT, label: 'not' }]
        },
        {
          name: 'Flow', signs: [
            { sign: Sign.COMMENT, label: 'comment' },
            { sign: Sign.IF, label: 'if' },
            { sign: Sign.ELSE, label: 'else' },
            { sign: Sign.WHILE, label: 'while' },
            { sign: Sign.FOR, label: 'for' },
            { sign: Sign.BREAK, label: 'break' },
            { sign: Sign.CONTINUE, label: 'continue' }]
        },
        {
          name: 'Classes and functions', signs: [
            { sign: Sign.CLASS, label: 'class' },
            { sign: Sign.PROP, label: 'Property access' },
            { sign: Sign.FUNCTION, label: 'function' },
            { sign: Sign.RETURN, label: 'return' }]
        }
      ],
      letterSize: { edgePx: 60, marginPx: 6 },
      focusedArea: FocusedArea.MAIN_EDITOR,
      isIOBoxVisible: false
    },
    storage: {
      loadState: LoadState.INITIAL,
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
