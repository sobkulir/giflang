import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import MaximizeSharpIcon from '@material-ui/icons/MaximizeSharp'
import * as React from 'react'
import { connect } from 'react-redux'
import { setIsIOBoxVisible } from '~/frontend/actions/ide'
import { LetterSize, SignToGifMap } from '~/frontend/types/ide'
import { State } from '~/frontend/types/redux'
import { Text } from '~/frontend/types/text-area'
import Input from './input'
import * as styles from './io-box.scss'
import { Output } from './output'

interface IOBoxProps {
  output: Text
  signToGifMap: SignToGifMap
  letterSize: LetterSize
  errorMsg: string
  isIOBoxVisible: boolean
  setIsIOBoxVisible: typeof setIsIOBoxVisible
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

interface ToggleButtonProps {
  isIOBoxVisible: boolean,
  setIsIOBoxVisible: typeof setIsIOBoxVisible
}

const ToggleButton: React.SFC<ToggleButtonProps> = (props) => {
  const toggle = () => props.setIsIOBoxVisible(!props.isIOBoxVisible)
  const label = (props.isIOBoxVisible) ? 'Hide' : 'Show'
  return (
    <div className={styles.toggleButton}>
      <IconButton onClick={toggle}>
        <MaximizeSharpIcon fontSize="small" />
      </IconButton>
    </div>
  )
}

const MinimizedIO: React.SFC = (_) => (
  <div className={styles.minimizedIO}>
    <Typography variant="h6">> I/O Console</Typography>
  </div>
)

const MaximizedIO: React.SFC<IOBoxProps> = (props) => {
  const factoredLetterSize = {
    edgePx: props.letterSize.edgePx * 0.7,
    marginPx: props.letterSize.marginPx * 0.8,
  }

  return (
    <div className={styles.maximizedIO}>
      <IOCard title={'Output'}>
        <Output
          output={props.output}
          letterSize={factoredLetterSize}
          signToGifMap={props.signToGifMap}
          errorMsg={props.errorMsg}
        />
      </IOCard>
      <IOCard title={'Input'}>
        <Input
          letterSize={factoredLetterSize}
        />
      </IOCard>
    </div>
  )
}

const IOBox: React.SFC<IOBoxProps> = (props) => {
  let content: React.ReactNode
  if (props.isIOBoxVisible) {
    content = <MaximizedIO {...props} />
  } else {
    content = <MinimizedIO />
  }
  return (
    <div className={styles.IOBox}>
      <ToggleButton
        isIOBoxVisible={props.isIOBoxVisible}
        setIsIOBoxVisible={props.setIsIOBoxVisible}
      />
      {content}
    </div>
  )
}

export default connect(
  (state: State) => ({
    output: state.execution.output,
    errorMsg: state.execution.errorMsg,
    signToGifMap: state.ide.signToGifMap,
    letterSize: state.ide.letterSize,
    isIOBoxVisible: state.ide.isIOBoxVisible
  }),
  {
    setIsIOBoxVisible
  })(IOBox)
