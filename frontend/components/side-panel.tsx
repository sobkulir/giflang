import React from 'react'
import DebugBox from './debug-box'
import LetterPicker from './letter-picker'
import * as styles from './side-panel.scss'

interface Props {
  isDebugMode: boolean
}

interface State {
  wasDebugModeLastRender: boolean
  isDebugBoxShown: boolean
}

export class SidePanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      wasDebugModeLastRender: false,
      isDebugBoxShown: false
    }
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    if (props.isDebugMode !== state.wasDebugModeLastRender) {
      return {
        wasDebugModeLastRender: props.isDebugMode,
        isDebugBoxShown: props.isDebugMode
      }
    }
    return null
  }

  clickHandler = () => {
    this.setState((state) => ({
      wasDebugModeLastRender: state.wasDebugModeLastRender,
      isDebugBoxShown: !state.isDebugBoxShown
    }))
  }

  render() {
    const panel = (this.state.isDebugBoxShown) ? <DebugBox /> : <LetterPicker />
    const buttonLabel = (this.state.isDebugBoxShown) ? 'Letters' : 'Env'
    const button = (
      <button
        className={styles.toggleButton}
        onClick={this.clickHandler}
      >
        {buttonLabel}
      </button>
    )
    return (
      <div className={styles.sidePanel}>
        {this.props.isDebugMode ? button : false}
        {panel}
      </div>
    )
  }

}
