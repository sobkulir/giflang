import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
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
        <Typography variant="h6">> Output</Typography>
        <Box fontFamily="Monospace" fontSize="h6.fontSize" component="p">
          {this.props.output}
        </Box>
      </div>
    )
  }
}

export default connect(
  (state: State) => ({
    output: state.editor.execution.output,
  }))(IOBox)
