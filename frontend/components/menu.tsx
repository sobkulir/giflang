import * as React from 'react'
import { connect } from 'react-redux'
import { finishExecution, startExecution } from '../redux/editor/actions'
import { RunState } from '../redux/editor/types'
import { saveCode } from '../redux/storage/actions'
import { State } from '../redux/types'
import * as styles from './menu.scss'

interface MenuProps {
  runState: RunState,
  goToNextStep: () => void,
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
  nextStep = (_: any) => {
    this.props.goToNextStep()
  }

  render() {
    return (
      <div className={styles.menu}>
        <button
          disabled={this.props.runState === RunState.RUNNING}
          onClick={this.executeCode}
        >
          Run
        </button>
        <button
          disabled={this.props.runState !== RunState.RUNNING}
          onClick={this.stopExecution}
        >
          Stop
        </button>
        <button
          onClick={this.saveCode}
        >
          Save
        </button>
        <button
          onClick={this.nextStep}
        >
          Next
        </button>
      </div>
    )
  }
}

export default connect(
  (state: State) => ({
    runState: state.editor.execution.state,
    goToNextStep: state.editor.execution.goToNextStep
  }),
  {
    startExecution,
    finishExecution,
    saveCode
  })(Menu)

