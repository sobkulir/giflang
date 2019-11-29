import React from 'react'
import { connect } from 'react-redux'
import { addLineToInput } from '~/frontend/actions/execution'
import { setFocusedArea } from '~/frontend/actions/ide'
import { addSignAfterCursor, moveCursor, removeAfterCursor } from '~/frontend/actions/text-area'
import { FocusedArea, LetterSize, SignToGifMap } from '~/frontend/types/ide'
import { State } from '~/frontend/types/redux'
import { ScrollableType, Text, TextArea, TextAreaType } from '~/frontend/types/text-area'
import { Content } from '../text-area/content'
import { Cursor } from '../text-area/cursor'
import { HandleExecutionInputShortcuts } from '../text-area/handle-shorcuts'
import * as styles from './input.scss'

export interface InputProps extends TextArea {
  letterSize: LetterSize
  signToGifMap: SignToGifMap
  commitedInput: Text,
  focusedArea: FocusedArea,
  addSignAfterCursor: typeof addSignAfterCursor
  moveCursor: typeof moveCursor
  removeAfterCursor: typeof removeAfterCursor
  addLineToInput: typeof addLineToInput
  setFocusedArea: typeof setFocusedArea
}

class Input extends React.Component<InputProps> {
  readonly contentWrapperRef: React.RefObject<HTMLDivElement>
  readonly cursorRef: React.RefObject<Cursor>

  constructor(props: InputProps) {
    super(props)
    this.cursorRef = React.createRef()
    this.contentWrapperRef = React.createRef()
  }

  componentDidUpdate() {
    if (this.props.scroll === ScrollableType.CURSOR) {
      this.cursorRef.current!.scrollIntoView()
    }

    this.setFocusIfNeeded()
  }

  handleKeyPress = (e: React.KeyboardEvent) => {
    HandleExecutionInputShortcuts(e, this.props)
  }

  handleClick = (_: React.MouseEvent) => {
    if (this.props.focusedArea !== FocusedArea.EXECUTION_INPUT) {
      this.props.setFocusedArea(FocusedArea.EXECUTION_INPUT)
    }
  }

  setFocusIfNeeded() {
    if (this.props.focusedArea === FocusedArea.EXECUTION_INPUT) {
      const textWrapper = this.contentWrapperRef.current as HTMLDivElement
      textWrapper.focus({ preventScroll: true })
    }
  }

  render() {
    return (
      <div
        className={styles.inputArea}
        onClick={this.handleClick}
      >
        <Content
          letterSize={this.props.letterSize}
          text={this.props.commitedInput}
          signToGifMap={this.props.signToGifMap}
        />
        <div
          className={styles.contentWrapper}
          ref={this.contentWrapperRef}
          onKeyDown={this.handleKeyPress}
          tabIndex={0}
        >
          <Cursor
            ref={this.cursorRef}
            letterSize={this.props.letterSize}
            position={this.props.cursorPosition}
          />
          <Content
            letterSize={this.props.letterSize}
            text={this.props.text}
            signToGifMap={this.props.signToGifMap}
          />
        </div>
      </div>
    )
  }
}

export default connect(
  (state: State) => ({
    ...state.textAreaMap[TextAreaType.EXECUTION_INPUT],
    commitedInput: state.execution.commitedInput,
    signToGifMap: state.ide.signToGifMap,
    focusedArea: state.ide.focusedArea
  }),
  {
    addSignAfterCursor,
    moveCursor,
    removeAfterCursor,
    addLineToInput,
    setFocusedArea
  }
)(Input)

