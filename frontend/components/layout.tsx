import * as React from 'react'
import IOBox from './io-box'
import * as styles from './layout.scss'
import LetterPicker from './letter-picker'
import Menu from './menu'
import TextArea from './text-area'


export class Layout extends React.Component<{}, {}> {
  constructor(props: {}) {
    super(props)
  }

  render() {
    return (
      <div className={styles.layoutWrapper}>
        <div className={styles.header}>
          <Menu />
        </div>
        <div className={styles.content}>
          <div className={styles.leftContent}>
            <TextArea />
            <IOBox />
          </div>
          <LetterPicker />
        </div>
      </div>
    )
  }
}

