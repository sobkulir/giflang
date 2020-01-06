import { ThunkAction } from 'redux-thunk'
import { ExecutionState } from './execution'
import { IDE } from './ide'
import { StorageState } from './storage'
import { TextAreaMap } from './text-area'

export interface State {
  readonly textAreaMap: TextAreaMap
  readonly execution: ExecutionState
  readonly ide: IDE
  readonly storage: StorageState
}

// "My" prefix is used to distinguish this interface from "Action" interface
// found in redux.
export interface MyAction<Payload = undefined> {
  type: string
  payload?: Payload
  reducer: (state: State) => State
}

export type MyThunkAction<T> = ThunkAction<Promise<T>, State, {}, MyAction<any>>

// A copy paste from a bleeding-edge version of Thunk.
// https://github.com/reduxjs/redux-thunk/blob/813b633b4cccb83fdd14da015424a1a5aed3026c/src/index.d.ts
/**
 * A generic type that takes a thunk action creator and returns a function
 * signature which matches how it would appear after being processed using
 * bindActionCreators(): a function that takes the arguments of the outer
 * function, and returns the return type of the inner "thunk" function.
 *
 * @template TActionCreator Thunk action creator to be wrapped
 */
export type ThunkActionDispatch<
  TActionCreator extends (...args: any[]) => ThunkAction<any, any, any, any>
  > = (
    ...args: Parameters<TActionCreator>
  ) => ReturnType<ReturnType<TActionCreator>>
