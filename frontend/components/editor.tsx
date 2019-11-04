import * as React from 'react'
import { connect } from 'react-redux'
import scrollIntoView from 'scroll-into-view-if-needed'
import { PositionRowColToPixels } from '../lib/editor'
import { addSignAfterCursor as _addSignAfterCursor, moveCursor as _moveCursor, newlineAfterCursor as _newlineAfterCursor, removeAfterCursor as _removeAfterCursor, setCursorPosition as _setCursorPosition } from '../redux/editor/actions'
import { EditorState, LetterRow, LetterSize, PositionRowCol, SignToGifMap } from '../redux/editor/types'
import { State } from '../redux/types'
import * as styles from './editor.scss'
import { HandleShorcuts } from './editorShorcuts'

interface RowProps {
  letterRow: LetterRow
  signToGifMap: SignToGifMap
  size: LetterSize
}

const Row: React.SFC<RowProps> = (props) => {
  const getLetterStyles = (letterSize: LetterSize): React.CSSProperties => ({
    width: `${letterSize.edgePx}px`,
    height: `${letterSize.edgePx}px`,
    padding: `${letterSize.marginPx}px`,
  })

  const row = props.letterRow.letters.map((letter) =>
    <img
      key={letter.id}
      style={getLetterStyles(props.size)}
      src={`/img/${props.signToGifMap.get(letter.sign)}`}
    />)

  const getRowStyles = (letterSize: LetterSize): React.CSSProperties => ({
    height: `${letterSize.edgePx + 2 * letterSize.marginPx}px`
  })
  return (
    <div className={styles.letterRow} style={getRowStyles(props.size)}>
      {row}
    </div>
  )
}

interface CursorProps {
  letterSize: LetterSize
}

const Cursor: React.SFC<CursorProps> = (props) => {
  const getCursorStyles = (letterSize: LetterSize): React.CSSProperties => ({
    width: '2px',
    height: `${letterSize.edgePx + 2 * letterSize.marginPx}px`,
    backgroundColor: 'black',
    position: 'relative',
    left: '-1px'
  })
  return (<div style={getCursorStyles(props.letterSize)} />)
}

interface EditorProps extends EditorState {
  setCursorPosition: typeof _setCursorPosition,
  addSignAfterCursor: typeof _addSignAfterCursor,
  moveCursor: typeof _moveCursor,
  removeAfterCursor: typeof _removeAfterCursor,
  newlineAfterCursor: typeof _newlineAfterCursor
}

class Editor extends React.Component<EditorProps, {}> {
  readonly textWrapperRef: React.RefObject<HTMLDivElement>
  readonly cursorRef: React.RefObject<HTMLDivElement>
  scrollToCursorAfterUpdate: boolean

  constructor(props: EditorProps) {
    super(props)
    this.scrollToCursorAfterUpdate = false
    this.textWrapperRef = React.createRef()
    this.cursorRef = React.createRef()
  }

  componentDidUpdate() {
    if (this.scrollToCursorAfterUpdate) {
      const cursor = this.cursorRef.current as HTMLDivElement
      scrollIntoView(cursor, {
        block: 'nearest',
        inline: 'nearest',
        scrollMode: 'if-needed'
      })
      this.scrollToCursorAfterUpdate = false
    }
  }

  getCursorPositionStyles = (letterSize: LetterSize, position: PositionRowCol)
    : React.CSSProperties => {
    const positionPixels = PositionRowColToPixels(letterSize, position)
    const boxSize = 2 * letterSize.marginPx + letterSize.edgePx
    return {
      position: 'absolute',
      padding: `${boxSize}px`,
      top: `${positionPixels.y - boxSize}px`,
      left: `${positionPixels.x - boxSize}px`
    }
  }

  handleOnMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const wrapper = this.textWrapperRef.current as HTMLDivElement
    wrapper.focus({ preventScroll: true })
    const wrapperRect = wrapper.getBoundingClientRect()
    console.log(wrapperRect)
    console.log(e.pageX)
    console.log(window.pageXOffset)
    this.props.setCursorPosition(
      {
        x: e.pageX - wrapperRect.left - window.pageXOffset,
        y: e.pageY - wrapperRect.top - window.pageYOffset
      })
  }
  handleKeyPress = (e: React.KeyboardEvent) => {
    const causedAction = HandleShorcuts(e, this.props)
    this.scrollToCursorAfterUpdate = causedAction
  }

  render() {
    const rows = this.props.text.map((letterRow) =>
      <Row
        key={letterRow.id}
        size={this.props.letterSize}
        letterRow={letterRow}
        signToGifMap={this.props.signToGifMap}
      />)

    const cursorWrapperStyle = this.getCursorPositionStyles(
      this.props.letterSize, this.props.cursorPosition)

    return (
      <div
        className={styles.editorWrapper}
      >
        <div
          className={styles.textWrapper}
          ref={this.textWrapperRef}
          onMouseDown={this.handleOnMouseDown}
          onKeyDown={this.handleKeyPress}
          tabIndex={0}
        >
          <div style={cursorWrapperStyle} ref={this.cursorRef}>
            <Cursor letterSize={this.props.letterSize} />
          </div>
          {rows}
        </div>
      </div>
    )
  }
}

export { EditorProps }
export default connect(
  (state: State) => ({
    ...state.editor,
  }),
  {
    setCursorPosition: _setCursorPosition,
    addSignAfterCursor: _addSignAfterCursor,
    moveCursor: _moveCursor,
    removeAfterCursor: _removeAfterCursor,
    newlineAfterCursor: _newlineAfterCursor
  }
)(Editor)

