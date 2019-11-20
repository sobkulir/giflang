
import Typography from '@material-ui/core/Typography'
import React from 'react'
import { connect } from 'react-redux'
import { SerializedEnvironment } from '~/interpreter/environment'
import { CallStack } from '~/interpreter/interpreter'
import { State } from '../types/redux'
import * as styles from './debug-box.scss'

interface DebugBoxProps {
  callStack: CallStack
  environment: SerializedEnvironment
}

const Card: React.SFC<{ title: string }> = (props) => {
  return (
    <div>
      <Typography variant="h6">> {props.title}</Typography>
      <div>{props.children}</div>
    </div>
  )
}

const StringContent: React.SFC<{ strings: string[] }> =
  (props) => {
    const rows = props.strings.map((value, idx) =>
      <div className={styles.entryWrapper} key={idx}>
        <div className={styles.entryText}>
          {value}
        </div>
        <div className={styles.entryTooltip} >
          {value}
        </div>
      </div>
    )
    return <div>{rows}</div>
  }

class DebugBox extends React.Component<DebugBoxProps> {
  render() {
    return (
      <div className={styles.debugBox}>
        <Card title={'Environment'}>
          <StringContent strings={this.props.environment} />
        </Card>
        <Card title={'Call stack'}>
          <StringContent strings={this.props.callStack.slice().reverse()} />
        </Card>
      </div>
    )
  }
}

export default connect(
  (state: State) => ({
    callStack: state.execution.callStack,
    environment: state.execution.environment
  })
)(DebugBox)

