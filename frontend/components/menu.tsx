import * as React from 'react'
import { connect } from 'react-redux'
import { finishExecution, startExecution } from '../redux/editor/actions'
import { RunState } from '../redux/editor/types'
import { saveCode } from '../redux/storage/actions'
import { State } from '../redux/types'
import * as styles from './menu.scss'

interface MenuProps {
  state: RunState,
  startExecution: typeof startExecution,
  finishExecution: typeof finishExecution
  saveCode: typeof saveCode
}

class Menu extends React.Component<MenuProps, {}> {
  executeCode = (_: any) => {
    this.props.startExecution()
  }
  stopExecution = (_: any) => {
    this.props.finishExecution()
  }
  saveCode = (_: any) => {
    this.props.saveCode()
  }

  render() {
    return (
      <div className={styles.menu}>
        <button
          disabled={this.props.state === RunState.RUNNING}
          onClick={this.executeCode}
        >
          Run
        </button>
        <button
          disabled={this.props.state !== RunState.RUNNING}
          onClick={this.stopExecution}
        >
          Stop
        </button>
        <button
          onClick={this.saveCode}
        >
          Save
        </button>
      </div>
    )
  }
}

export default connect(
  (state: State) => ({
    state: state.editor.execution.state,
  }),
  {
    startExecution,
    finishExecution,
    saveCode
  })(Menu)

