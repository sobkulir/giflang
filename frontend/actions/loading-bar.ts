import produce from 'immer'
import { LoadingBarState } from '../types/ide'
import { MyAction, State } from '../types/redux'

export const setLoadingBarState =
  (loadingBarState: LoadingBarState): MyAction<LoadingBarState> => ({
    type: 'Set loading bar state',
    payload: loadingBarState,
    reducer: produce((state: State) => {
      state.ide.loadingBarState = loadingBarState
    })
  })
