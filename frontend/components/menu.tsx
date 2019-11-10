import * as React from 'react'
import { connect } from 'react-redux'
import { finishExecution as _finishExecution, startExecution as _startExecution } from '../redux/editor/actions'
import { RunState } from '../redux/editor/types'
import { State } from '../redux/types'
import * as styles from './menu.scss'

interface MenuProps {
  state: RunState,
  startExecution: typeof _startExecution,
  finishExecution: typeof _finishExecution
}

class Menu extends React.Component<MenuProps, {}> {
  executeCode = (_: any) => {
    this.props.startExecution()
  }
  stopExecution = (_: any) => {
    this.props.finishExecution()
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
      </div>
    )
  }
}

export default connect(
  (state: State) => ({
    state: state.editor.execution.state,
  }),
  {
    startExecution: _startExecution,
    finishExecution: _finishExecution,
  })(Menu)

