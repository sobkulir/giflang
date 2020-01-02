export enum LoadState {
  INITIAL, LOADING, LOADED
}

export type DocumentReference = firebase.firestore.DocumentReference
export interface StorageState {
  doc?: DocumentReference
  userId?: string
  loadState: LoadState
}
