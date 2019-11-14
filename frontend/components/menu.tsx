import * as React from 'react'
import { connect } from 'react-redux'
import { finishExecution, startExecution } from '../redux/editor/actions'
import { RunState } from '../redux/editor/types'
import { saveCode } from '../redux/storage/actions'
import { State } from '../redux/types'
import * as styles from './menu.scss'

interface MenuProps {
  runState: RunState,
  resolveNextStep: () => void,
  startExecution: typeof startExecution,
  finishExecution: typeof finishExecution
  saveCode: typeof saveCode,
}

class Menu extends React.Component<MenuProps, {}> {
  startExecutionNormal = (_: any) => {
    this.props.startExecution(/*debugMode=*/false)
  }
  startExecutionDebug = (_: any) => {
    this.props.startExecution(/*debugMode=*/true)
  }
  stopExecution = (_: any) => {
    this.props.finishExecution()
  }
  saveCode = (_: any) => {
    this.props.saveCode()
  }
  resolveNextStep = (_: any) => {
    this.props.resolveNextStep()
  }
  isWorkerRunning() {
    return this.props.runState in [
      RunState.DEBUG_RUNNING, RunState.DEBUG_WAITING, RunState.RUNNING
    ]
  }

  render() {
    return (
      <div className={styles.menu}>
        <button
          disabled={this.props.runState !== RunState.NOT_RUNNING}
          onClick={this.startExecutionNormal}
        >
          Run
        </button>
        <button
          disabled={!this.isWorkerRunning()}
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
          onClick={this.startExecutionDebug}
          disabled={this.props.runState !== RunState.NOT_RUNNING}
        >
          Debug
        </button>
        <button
          onClick={this.resolveNextStep}
          disabled={this.props.runState !== RunState.DEBUG_WAITING}
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
    resolveNextStep: state.editor.execution.resolveNextStep
  }),
  {
    startExecution,
    finishExecution,
    saveCode,
  })(Menu)

