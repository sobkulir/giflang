import * as React from 'react'
import { connect } from 'react-redux'
import { startExecution as _startExecution } from '../redux/editor/actions'
import { State } from '../redux/types'
import * as styles from './menu.scss'

interface MenuProps {
  isExecuting: boolean,
  startExecution: typeof _startExecution
}

class Menu extends React.Component<MenuProps, {}> {
  executeCode = (_: any) => {
    this.props.startExecution()
  }

  render() {
    return (
      <div className={styles.menu}>
        <button
          disabled={this.props.isExecuting}
          onClick={this.executeCode}
        >
          Run
        </button>
        {this.props.isExecuting ? 'zase prace?' : 'tak ja teda jdu'}
      </div>
    )
  }
}

export default connect(
  (state: State) => ({
    isExecuting: state.editor.execution.isExecuting,
  }),
  {
    startExecution: _startExecution
  })(Menu)

