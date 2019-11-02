import * as React from 'react'
import { connect } from 'react-redux'
import { PositionRowColToPixels } from '../lib/editor'
import { addSignAfterCursor as _addSignAfterCursor, Direction, moveCursor as _moveCursor, newlineAfterCursor as _newlineAfterCursor, removeAfterCursor as _removeAfterCursor, setCursorPosition as _setCursorPosition } from '../redux/editor/actions'
import { Sign } from '../redux/editor/sign'
import { EditorState, LetterRow, LetterSize, PositionRowCol, SignToGifMap } from '../redux/editor/types'
import { State } from '../redux/types'
import * as styles from './editor.scss'

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
    <div style={getRowStyles(props.size)}>
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
    position: 'absolute',
    top: '0',
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
  readonly editorWrapperRef: React.RefObject<HTMLDivElement>
  constructor(props: EditorProps) {
    super(props)
    this.editorWrapperRef = React.createRef()
  }

  getCursorPositionStyles = (letterSize: LetterSize, position: PositionRowCol)
    : React.CSSProperties => {
    const positionPixels = PositionRowColToPixels(letterSize, position)
    return {
      position: 'absolute',
      top: `${positionPixels.y}px`,
      left: `${positionPixels.x}px`
    }
  }

  handleOnMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const wrapper = this.editorWrapperRef.current as HTMLDivElement
    wrapper.focus({ preventScroll: true })
    const wrapperRect = wrapper.getBoundingClientRect()
    this.props.setCursorPosition(
      {
        x: e.pageX - wrapperRect.left - window.pageXOffset,
        y: e.pageY - wrapperRect.top - window.pageYOffset
      })
  }
  handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'A') {
      this.props.addSignAfterCursor(Sign[e.key])
    } else if (e.key === 'ArrowRight') {
      this.props.moveCursor(Direction.RIGHT)
    } else if (e.key === 'ArrowDown') {
      this.props.moveCursor(Direction.DOWN)
    } else if (e.key === 'ArrowLeft') {
      this.props.moveCursor(Direction.LEFT)
    } else if (e.key === 'ArrowUp') {
      this.props.moveCursor(Direction.UP)
    } else if (e.key === 'Delete') {
      this.props.removeAfterCursor()
    } else if (e.key === 'Backspace') {
      this.props.moveCursor(Direction.LEFT)
      this.props.removeAfterCursor()
    } else if (e.key === 'Enter') {
      this.props.newlineAfterCursor()
    }
    console.log(e.key)
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
      <div>
        <div
          className={styles.editor}
          ref={this.editorWrapperRef}
          onMouseDown={this.handleOnMouseDown}
          onKeyDown={this.handleKeyPress}
          tabIndex={0}
        >
          <div style={cursorWrapperStyle}>
            <Cursor letterSize={this.props.letterSize} />
          </div>
          {rows}
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
    setCursorPosition: _setCursorPosition,
    addSignAfterCursor: _addSignAfterCursor,
    moveCursor: _moveCursor,
    removeAfterCursor: _removeAfterCursor,
    newlineAfterCursor: _newlineAfterCursor
  }
)(Editor)

