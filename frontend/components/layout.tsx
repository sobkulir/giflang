import * as React from 'react'
import { connect } from 'react-redux'
import { isDebugMode, RunState } from '../types/execution'
import { State } from '../types/redux'
import DebugBox from './debug-box'
import IOBox from './io-box/io-box'
import * as styles from './layout.scss'
import LetterPicker from './letter-picker'
import Menu from './menu'
import MainTextArea from './text-area/main-text-area'

interface LayoutProps {
  runState: RunState
}

const Layout: React.SFC<LayoutProps> = (props) => {
  return (
    <div className={styles.layoutWrapper}>
      <div className={styles.header}>
        <Menu />
      </div>
      <div className={styles.content}>
        <div className={styles.leftContent}>
          <MainTextArea />
          <IOBox />
        </div>
        {isDebugMode(props.runState) ? <DebugBox /> : <LetterPicker />}
      </div>
    </div>
  )
}

export default connect(
  (state: State) => ({
    runState: state.execution.runState
  })
)(Layout)
