import React from 'react'
import { connect } from 'react-redux'
import { addSignAfterCursor, moveCursor, newlineAfterCursor, removeAfterCursor, setCursorPosition } from '~/frontend/actions/text-area'
import { RunState } from '~/frontend/types/execution'
import { LetterSize, SignToGifMap } from '~/frontend/types/ide'
import { State } from '~/frontend/types/redux'
import { ScrollableType, TextArea, TextAreaType } from '~/frontend/types/text-area'
import { JisonLocator } from '~/interpreter/ast/ast-node'
import { Content } from './content'
import { Cursor } from './cursor'
import { HandleMainEditorShorcuts } from './handle-shorcuts'
import { Highlighter } from './highlighter'
import { LineNumbers } from './line-numbers'
import * as styles from './main-text-area.scss'

export interface MainTextAreaProps extends TextArea {
  locator: JisonLocator,
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
  readonly highlighterRef: React.RefObject<Highlighter>

  readonly areaType = TextAreaType.MAIN_EDITOR

  constructor(props: MainTextAreaProps) {
    super(props)
    this.contentWrapperRef = React.createRef()
    this.cursorRef = React.createRef()
    this.highlighterRef = React.createRef()
  }

  componentDidMount() {
    this.setFocusOnText()
  }

  componentDidUpdate() {
    switch (this.props.scroll) {
      case ScrollableType.CURSOR:
        this.cursorRef.current!.scrollIntoView(); break
      case ScrollableType.HIGHLIGHT:
        this.highlighterRef.current!.scrollIntoView(); break
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
    HandleMainEditorShorcuts(e, this.props)
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
            ref={this.highlighterRef}
            letterSize={this.props.letterSize}
            locator={this.props.locator}
            runState={this.props.runState}
            text={this.props.text}
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
    locator: state.execution.locator,
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

