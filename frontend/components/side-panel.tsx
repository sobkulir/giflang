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
  componentWillReceiveProps(newProps: Props) {
    if (newProps.isDebugMode !== this.state.wasDebugModeLastRender) {
      this.setState({
        wasDebugModeLastRender: newProps.isDebugMode,
        isDebugBoxShown: newProps.isDebugMode
      })
    }
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
