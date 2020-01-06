import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import * as React from 'react'
import { connect } from 'react-redux'
import { finishExecution, startExecution } from '../actions/execution'
import { saveCode } from '../actions/storage'
import { setText } from '../actions/text-area'
import { RunState } from '../types/execution'
import { State, ThunkActionDispatch } from '../types/redux'
import { TextAreaType } from '../types/text-area'
import { ExamplesButton } from './examples'
import * as styles from './menu.scss'

interface MenuProps {
  runState: RunState,
  resolveNextStep: () => void,
  startExecution: typeof startExecution,
  finishExecution: typeof finishExecution
  saveCode: ThunkActionDispatch<typeof saveCode>
  setText: typeof setText
}

interface MenuState {
  isExamplesOpen: boolean
}

class Menu extends React.Component<MenuProps, MenuState> {
  setCode = (code: string) => {
    this.props.setText(TextAreaType.MAIN_EDITOR, code)
  }

  startExecutionNormal = (_: any) => {
    this.props.startExecution(/*debugMode=*/false)
  }
  startExecutionDebug = (_: any) => {
    this.props.startExecution(/*debugMode=*/true)
  }
  stopExecution = (_: any) => {
    this.props.finishExecution('')
  }
  saveCode = (_: any) => {
    this.props.saveCode()
  }
  resolveNextStep = (_: any) => {
    this.props.resolveNextStep()
  }
  isWorkerRunning() {
    return [
      RunState.DEBUG_RUNNING, RunState.DEBUG_WAITING, RunState.RUNNING
    ].includes(this.props.runState)
  }

  render() {
    return (
      <div className={styles.menu}>
        <ButtonGroup
          className={styles.executionMenu}
          size="medium"
          variant="text"
        >
          <Button
            disabled={this.props.runState !== RunState.NOT_RUNNING}
            onClick={this.startExecutionNormal}
          >
            Run
          </Button>
          <Button
            disabled={!this.isWorkerRunning()}
            onClick={this.stopExecution}
          >
            Stop
          </Button>
          <Button
            onClick={this.saveCode}
          >
            Save
          </Button>
          <Button
            onClick={this.startExecutionDebug}
            disabled={this.props.runState !== RunState.NOT_RUNNING}
          >
            Debug
          </Button>
          <Button
            onClick={this.resolveNextStep}
            disabled={this.props.runState !== RunState.DEBUG_WAITING}
          >
            Next
          </Button>
        </ButtonGroup>

        <div className={styles.auxMenu}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            href="docs"
            target="_blank"
          >
            Docs
          </Button>
          <ExamplesButton setCode={this.setCode} />
        </div>
      </div>
    )
  }
}

export default connect(
  (state: State) => ({
    runState: state.execution.runState,
    resolveNextStep: state.execution.resolveNextStep
  }),
  {
    startExecution,
    finishExecution,
    saveCode,
    setText,
  })(Menu)
