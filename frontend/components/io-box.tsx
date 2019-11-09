import * as React from 'react'
import { connect } from 'react-redux'
import { State } from '../redux/types'
import * as styles from './io-box.scss'

interface IOBoxProps {
  output: string
}

class IOBox extends React.Component<IOBoxProps, {}> {
  render() {
    return (
      <div className={styles.ioBox}>
        <h4>> Output</h4>
        <p>
          {this.props.output}
        </p>
      </div>
    )
  }
}

export default connect(
  (state: State) => ({
    output: state.editor.execution.output,
  }))(IOBox)
