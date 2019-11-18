import React from 'react'
import { connect } from 'react-redux'
import { addSignAfterCursor, moveCursor, newlineAfterCursor, removeAfterCursor, setCursorPosition } from '~/frontend/actions/text-area'
import { RunState } from '~/frontend/types/execution'
import { LetterSize, SignToGifMap } from '~/frontend/types/ide'
import { State } from '~/frontend/types/redux'
import { TextArea, TextAreaType } from '~/frontend/types/text-area'
import { Content } from './content'
import { Cursor } from './cursor'
import { HandleMainEditorShorcuts } from './handle-shorcuts'
import { Highlighter } from './highlighter'
import { LineNumbers } from './line-numbers'
import * as styles from './main-text-area.scss'

export interface MainTextAreaProps extends TextArea {
  lineno: number,
  runState: RunState,
  signToGifMap: SignToGifMap,
  letterSize: LetterSize,
  setCursorPosition: typeof setCursorPosition,
  addSignAfterCursor: typeof addSignAfterCursor,
  moveCursor: typeof moveCursor,
  removeAfterCursor: typeof removeAfterCursor,
  newlineAfterCursor: typeof newlineAfterCursor
}

class MainTextArea extends React.Component<MainTextAreaProps, {}> {
  readonly contentWrapperRef: React.RefObject<HTMLDivElement>
  readonly cursorRef: React.RefObject<Cursor>
  readonly areaType = TextAreaType.MAIN_EDITOR
  scrollToCursorAfterUpdate: boolean

  constructor(props: MainTextAreaProps) {
    super(props)
    this.scrollToCursorAfterUpdate = false
    this.contentWrapperRef = React.createRef()
    this.cursorRef = React.createRef()
  }

  componentDidMount() {
    this.setFocusOnText()
  }

  componentDidUpdate() {
    if (this.scrollToCursorAfterUpdate) {
      this.cursorRef.current!.scrollIntoView()
      this.scrollToCursorAfterUpdate = false
    }
    // Set focus after an update to maintain focus after adding a letter from
    // the right panel (letter picker).
    this.setFocusOnText()
  }

  setFocusOnText() {
    const textWrapper = this.contentWrapperRef.current as HTMLDivElement
    textWrapper.focus({ preventScroll: true })
  }

  moveCursor = (e: React.MouseEvent) => {
    e.preventDefault()
    const textWrapper = this.contentWrapperRef.current as HTMLDivElement
    const wrapperRect = textWrapper.getBoundingClientRect()
    this.props.setCursorPosition(
      this.areaType,
      {
        x: Math.max(0, e.pageX - wrapperRect.left - window.pageXOffset),
        y: Math.max(0, e.pageY - wrapperRect.top - window.pageYOffset)
      })
  }

  handleKeyPress = (e: React.KeyboardEvent) => {
    const didCauseAction = HandleMainEditorShorcuts(e, this.props)
    this.scrollToCursorAfterUpdate = didCauseAction
  }

  render() {
    return (
      <div
        className={styles.textArea}
        onMouseDown={this.moveCursor}
      >
        <div className={styles.lineNumbersWrapper}>
          <LineNumbers
            textRowCount={this.props.text.length}
            letterSize={this.props.letterSize}
          />
        </div>
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
          <Highlighter
            letterSize={this.props.letterSize}
            lineno={this.props.lineno}
            runState={this.props.runState}
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
    ...state.textAreaMap[TextAreaType.MAIN_EDITOR],
    signToGifMap: state.ide.signToGifMap,
    letterSize: state.ide.letterSize,
    lineno: state.execution.lineno,
    runState: state.execution.runState
  }),
  {
    setCursorPosition,
    addSignAfterCursor,
    moveCursor,
    removeAfterCursor,
    newlineAfterCursor
  }
)(MainTextArea)

