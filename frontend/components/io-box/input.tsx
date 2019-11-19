import React from 'react'
import { connect } from 'react-redux'
import { addLineToInput } from '~/frontend/actions/execution'
import { addSignAfterCursor, moveCursor, removeAfterCursor } from '~/frontend/actions/text-area'
import { LetterSize, SignToGifMap } from '~/frontend/types/ide'
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
  addSignAfterCursor: typeof addSignAfterCursor
  moveCursor: typeof moveCursor
  removeAfterCursor: typeof removeAfterCursor
  addLineToInput: typeof addLineToInput
}

class Input extends React.Component<InputProps> {
  readonly cursorRef: React.RefObject<Cursor>
  readonly areaType = TextAreaType.EXECUTION_INPUT

  constructor(props: InputProps) {
    super(props)
    this.cursorRef = React.createRef()
  }

  componentDidUpdate() {
    if (this.props.scroll === ScrollableType.CURSOR) {
      this.cursorRef.current!.scrollIntoView()
    }
  }
  handleKeyPress = (e: React.KeyboardEvent) => {
    HandleExecutionInputShortcuts(e, this.props)
  }

  render() {
    return (
      <div
        className={styles.inputArea}
      >
        <Content
          letterSize={this.props.letterSize}
          text={this.props.commitedInput}
          signToGifMap={this.props.signToGifMap}
        />
        <div
          className={styles.contentWrapper}
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
  }),
  {
    addSignAfterCursor,
    moveCursor,
    removeAfterCursor,
    addLineToInput,
  }
)(Input)

