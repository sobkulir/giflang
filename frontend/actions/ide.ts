import produce from 'immer'
import { FocusedArea, LoadingBarState } from '../types/ide'
import { MyAction, State } from '../types/redux'

export const setLoadingBarState =
  (loadingBarState: LoadingBarState): MyAction<LoadingBarState> => ({
    type: 'Set loading bar state',
    payload: loadingBarState,
    reducer: produce((state: State) => {
      state.ide.loadingBarState = loadingBarState
    })
  })

export const setFocusedArea =
  (focusedArea: FocusedArea): MyAction<FocusedArea> => ({
    type: 'Set focused area',
    payload: focusedArea,
    reducer: produce((state: State) => {
      state.ide.focusedArea = focusedArea
    })
  })

export const setIsIOBoxVisible =
  (isVisible: boolean): MyAction<boolean> => ({
    type: 'Set is IOBox visible',
    payload: isVisible,
    reducer: produce((state: State) => {
      state.ide.isIOBoxVisible = isVisible
    })
  })
