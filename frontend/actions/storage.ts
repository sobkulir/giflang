import firebase from 'firebase/app'
import 'firebase/firestore'
import produce from 'immer'
import { SignsToTokens } from '../lib/editor'
import { LoadingBarState } from '../types/ide'
import { MyAction, MyThunkAction, State } from '../types/redux'
import { DocumentReference, LoadState, SaveState } from '../types/storage'
import { TextAreaType } from '../types/text-area'
import { setLoadingBarState } from './ide'
import { setText } from './text-area'

export const loadCode =
  (codeId: string): MyThunkAction<void> =>
    async (dispatch): Promise<void> => {
      if (codeId === undefined) {
        dispatch(setLoadState(LoadState.LOADED))
        return
      }

      dispatch(setLoadingBarState(LoadingBarState.START))

      const doc =
        await firebase.firestore().collection('programs').doc(codeId).get()
      const res = doc.data()
      let code = `D4;D0;D4;\nN;O;T;SPACE;F;O;U;N;D;`
      if (res !== undefined) {
        code = res.code
      }
      dispatch(setText(TextAreaType.MAIN_EDITOR, code))
      dispatch(setLoadState(LoadState.LOADED))
      dispatch(setLoadingBarState(LoadingBarState.COMPLETE))
    }

export const saveCode =
  (): MyThunkAction<void> =>
    async (dispatch, getState): Promise<void> => {
      const state = getState()
      dispatch(setLoadingBarState(LoadingBarState.START))
      dispatch(setSaveState(SaveState.SAVING))
      let doc = state.storage.doc
      if (!doc) {
        doc = await firebase.firestore().collection('programs').doc()
        window.history.pushState({}, '', `${doc.id}`)
        dispatch(setDoc(doc))
      }
      await doc.set({
        code: SignsToTokens(
          state.textAreaMap[TextAreaType.MAIN_EDITOR].text)
      })
      dispatch(setSaveState(SaveState.SAVED))
      dispatch(setLoadingBarState(LoadingBarState.COMPLETE))
    }

const setSaveState =
  (saveState: SaveState): MyAction<SaveState> => ({
    type: 'Set load state',
    payload: saveState,
    reducer: produce((state: State) => {
      state.storage.saveState = saveState
    })
  })

const setLoadState =
  (loadState: LoadState): MyAction<LoadState> => ({
    type: 'Set load state',
    payload: loadState,
    reducer: produce((state: State) => {
      state.storage.loadState = loadState
    })
  })

const setDoc =
  (doc: DocumentReference): MyAction<DocumentReference> => ({
    type: 'Set load state',
    payload: doc,
    reducer: produce((state: State) => {
      state.storage.doc = doc
    })
  })
