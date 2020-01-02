import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import produce from 'immer'
import { SignsToChars } from '../lib/editor'
import { LoadingBarState } from '../types/ide'
import { MyAction, MyThunkAction, State } from '../types/redux'
import { DocumentReference, LoadState } from '../types/storage'
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
      let code = `404\nNOT FOUND`
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
      let userId = state.storage.userId
      let doc = state.storage.doc
      if (!userId) {
        const anonym = await firebase.auth().signInAnonymously()
        if (anonym && anonym.user) {
          userId = anonym.user.uid
        } else {
          alert('File not saved: anonymous session could not be created')
          dispatch(setLoadingBarState(LoadingBarState.COMPLETE))
          return
        }
      }
      if (!doc) {
        doc = await firebase.firestore().collection('programs').doc()
        window.history.pushState({}, '', `${doc.id}`)
        dispatch(setDoc(doc))
      }

      await doc.set({
        code: SignsToChars(
          state.textAreaMap[TextAreaType.MAIN_EDITOR].text),
        ownerUID: userId,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      }).catch((reason) => {
        alert('Saving unsuccessful. Programs can only be saved every 5s.')
      })
      dispatch(setLoadingBarState(LoadingBarState.COMPLETE))
    }

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
