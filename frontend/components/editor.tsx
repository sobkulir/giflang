import * as React from 'react'
import * as styles from './editor.scss'
import LetterPicker from './letter-picker'
import TextArea from './text-area'

export class Editor extends React.Component<{}, {}> {
  render() {
    return (
      <div className={styles.editor}>
        <TextArea />
        <LetterPicker />
      </div>
    )
  }
}

