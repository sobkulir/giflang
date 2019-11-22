export enum LoadState {
  INITIAL, LOADING, LOADED
}

export enum SaveState {
  SAVING, SAVED
}

export type DocumentReference = firebase.firestore.DocumentReference
export interface StorageState {
  doc?: DocumentReference
  loadState: LoadState,
  saveState: SaveState
}
