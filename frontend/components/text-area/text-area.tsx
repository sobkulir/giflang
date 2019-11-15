import * as React from 'react'
import { connect } from 'react-redux'
import { addSignAfterCursor, moveCursor, newlineAfterCursor, removeAfterCursor, setCursorPosition } from '../../redux/editor/actions'
import { EditorState } from '../../redux/editor/types'
import { State } from '../../redux/types'
import { Content } from './content'
import { Cursor } from './cursor'
import { Highlighter } from './highlighter'
import { HandleShorcuts } from './key-shorcuts'
import { LineNumbers } from './line-numbers'
import * as styles from './text-area.scss'

export interface TextAreaProps extends EditorState {
  setCursorPosition: typeof setCursorPosition,
  addSignAfterCursor: typeof addSignAfterCursor,
  moveCursor: typeof moveCursor,
  removeAfterCursor: typeof removeAfterCursor,
  newlineAfterCursor: typeof newlineAfterCursor
}

class TextArea extends React.Component<TextAreaProps, {}> {
  readonly contentWrapperRef: React.RefObject<HTMLDivElement>
  readonly cursorRef: React.RefObject<Cursor>
  scrollToCursorAfterUpdate: boolean

  constructor(props: TextAreaProps) {
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
      {
        x: Math.max(0, e.pageX - wrapperRect.left - window.pageXOffset),
        y: Math.max(0, e.pageY - wrapperRect.top - window.pageYOffset)
      })
  }

  handleKeyPress = (e: React.KeyboardEvent) => {
    const didCauseAction = HandleShorcuts(e, this.props)
    this.scrollToCursorAfterUpdate = didCauseAction
  }

  render() {
    return (
      <div
        className={styles.textArea}
        onMouseDown={this.moveCursor}
      >
        <div className={styles.lineNumbersWrapper}>
          <LineNumbers textRowCount={this.props.text.length} />
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
            lineno={this.props.execution.lineno}
            runState={this.props.execution.state}
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
    ...state.editor,
  }),
  {
    setCursorPosition,
    addSignAfterCursor,
    moveCursor,
    removeAfterCursor,
    newlineAfterCursor
  }
)(TextArea)

