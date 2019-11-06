import * as React from 'react'
import * as styles from './editor.scss'
import LetterPicker from './letter-picker'
import Menu from './menu'
import TextArea from './text-area'


export class Editor extends React.Component<{}, {}> {
  constructor(props: {}) {
    super(props)
  }

  render() {
    return (
      <div className={styles.editor}>
        <Menu />
        <TextArea />
        <LetterPicker />
      </div>
    )
  }
}

