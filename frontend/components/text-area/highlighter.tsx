import React from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import { isDebugMode, RunState } from '~/frontend/types/execution'
import { LetterSize } from '~/frontend/types/ide'
import { Text } from '~/frontend/types/text-area'
import { JisonLocator } from '~/interpreter/ast/ast-node'

interface HighlighterProps {
  letterSize: LetterSize
  runState: RunState
  locator: JisonLocator
  text: Text
}

interface SingleHighlightProps {
  line: number
  firstColumn: number
  lastColumn: number
  letterSize: LetterSize
}

const SingleHighlight: React.SFC<SingleHighlightProps> = React.memo((props) => {
  const getStyles = (): React.CSSProperties => {
    const boxSize =
      2 * props.letterSize.marginPx + props.letterSize.edgePx
    return {
      position: 'absolute',
      left: `${(props.firstColumn - 1) * boxSize}`,
      top: `${(props.line - 1) * boxSize}`,
      background: 'orange',
      opacity: '0.5',
      width: `${(props.lastColumn - props.firstColumn + 1) * boxSize}px`,
      height: `${boxSize}`
    }
  }

  return <div style={getStyles()} />
})

export class Highlighter extends React.PureComponent<HighlighterProps> {
  readonly scrollRef: React.RefObject<HTMLDivElement>

  constructor(props: HighlighterProps) {
    super(props)
    this.scrollRef = React.createRef()
  }

  scrollIntoView() {
    if (this.scrollRef.current) {
      scrollIntoView(this.scrollRef.current, {
        block: 'nearest',
        inline: 'nearest',
        scrollMode: 'if-needed'
      })
    }
  }

  createHighlights = () => {
    const { first_line, last_line, first_column, last_column }
      = this.props.locator
    const highlights: React.ReactNode[] = []

    for (let i = first_line; i <= last_line; i++) {
      const startCol = (i === first_line) ? first_column : 1
      let endCol = 1
      if (i === last_line) {
        endCol = last_column
      } else if (this.props.text.length >= i) {
        endCol = this.props.text[i - 1].letters.length
      }
      highlights.push((
        <SingleHighlight
          key={i}
          letterSize={this.props.letterSize}
          firstColumn={startCol}
          lastColumn={endCol}
          line={i}
        />
      ))
    }
    return highlights
  }

  getScrollRefStyles = (): React.CSSProperties => {
    const { first_line, last_line, first_column, last_column }
      = this.props.locator
    const boxSize =
      2 * this.props.letterSize.marginPx + this.props.letterSize.edgePx

    let widthUnits = 0
    if (first_line === last_line) {
      widthUnits = last_column - first_column
    } else if (this.props.text.length >= first_line) {
      widthUnits = this.props.text[first_line - 1].letters.length
    }
    return {
      position: 'absolute',
      top: `${(first_line - 3) * boxSize}px`,
      left: `${(first_column - 4) * boxSize}px`,
      height: `${(last_line - first_line + 3) * boxSize}px`,
      width: `${(widthUnits + 5) * boxSize}px`
    }
  }

  render() {
    if (isDebugMode(this.props.runState)) {
      return (
        <div>
          <div style={this.getScrollRefStyles()} ref={this.scrollRef} />
          {this.createHighlights()}
        </div>)
    } else {
      return <div />
    }
  }
}
