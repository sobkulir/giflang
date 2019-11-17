import Typography from '@material-ui/core/Typography'
import * as React from 'react'
import { connect } from 'react-redux'
import { LetterSize, SignToGifMap, Text } from '~/frontend/types/editor'
import { State } from '../../types/redux'
import * as styles from './io-box.scss'
import { Output } from './output'

interface IOBoxProps {
  output: Text,
  signToGifMap: SignToGifMap,
  letterSize: LetterSize
}

class IOBox extends React.Component<IOBoxProps> {
  render() {
    return (
      <div className={styles.ioBox}>
        <Typography variant="h6">> Output</Typography>
        <Output
          output={this.props.output}
          letterSize={this.props.letterSize}
          signToGifMap={this.props.signToGifMap}
        />
      </div>
    )
  }
}

export default connect(
  (state: State) => ({
    output: state.execution.output,
    signToGifMap: state.editor.signToGifMap,
    letterSize: state.editor.letterSize
  }))(IOBox)
