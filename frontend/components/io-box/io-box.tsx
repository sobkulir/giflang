import Typography from '@material-ui/core/Typography'
import * as React from 'react'
import { connect } from 'react-redux'
import { LetterSize, SignToGifMap } from '~/frontend/types/ide'
import { State } from '~/frontend/types/redux'
import { Text } from '~/frontend/types/text-area'
import Input from './input'
import * as styles from './io-box.scss'
import { Output } from './output'

interface IOBoxProps {
  output: Text,
  signToGifMap: SignToGifMap,
  letterSize: LetterSize
}

interface IOCardProps {
  title: string
}

const IOCard: React.SFC<IOCardProps> = (props) => (
  <div className={styles.ioCard}>
    <Typography variant="h6">> {props.title}</Typography>
    {props.children}
  </div>
)
class IOBox extends React.Component<IOBoxProps> {
  readonly factoredLetterSize: LetterSize
  constructor(props: IOBoxProps) {
    super(props)
    this.factoredLetterSize = {
      edgePx: this.props.letterSize.edgePx * 0.5,
      marginPx: this.props.letterSize.marginPx * 0.8,
    }
  }
  render() {
    return (
      <div className={styles.ioBox}>
        <IOCard title={'Output'}>
          <Output
            output={this.props.output}
            letterSize={this.factoredLetterSize}
            signToGifMap={this.props.signToGifMap}
          />
        </IOCard>
        <IOCard title={'Input'}>
          <Input
            letterSize={this.factoredLetterSize}
          />
        </IOCard>
      </div>
    )
  }
}

export default connect(
  (state: State) => ({
    output: state.execution.output,
    signToGifMap: state.ide.signToGifMap,
    letterSize: state.ide.letterSize
  }))(IOBox)
