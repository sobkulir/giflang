import firebase from 'firebase/app'
import 'firebase/firestore'
import produce from 'immer'
import { SignsToTokens } from '../lib/editor'
import { MyAction, State } from '../types/redux'

export const saveCode =
  (): MyAction<void> => ({
    type: 'Save code',
    reducer: produce((state: State) => {
      firebase.firestore().collection('programs')
      firebase.firestore().collection('programs').add({
        code: SignsToTokens(state.editor.text)
      })
    })
  })
