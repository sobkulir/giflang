import React from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import { PositionRowColToPixels } from '~/frontend/lib/text-area'
import { LetterSize } from '~/frontend/types/ide'
import { PositionRowCol } from '~/frontend/types/text-area'

export interface CursorProps {
  letterSize: LetterSize
  position: PositionRowCol
}

export class Cursor extends React.Component<CursorProps>  {
  readonly wrapperRef: React.RefObject<HTMLDivElement>

  constructor(props: CursorProps) {
    super(props)
    this.wrapperRef = React.createRef()
  }

  scrollIntoView() {
    const wrapperRef = this.wrapperRef.current as HTMLDivElement
    scrollIntoView(wrapperRef, {
      block: 'nearest',
      inline: 'nearest',
      scrollMode: 'if-needed'
    })
  }

  getWrapperStyles = (): React.CSSProperties => {
    const positionPixels = PositionRowColToPixels(
      this.props.letterSize, this.props.position)
    const boxSize =
      2 * this.props.letterSize.marginPx + this.props.letterSize.edgePx
    return {
      position: 'absolute',
      padding: `${boxSize}px`,
      top: `${positionPixels.y - boxSize}px`,
      left: `${positionPixels.x - boxSize}px`
    }
  }

  getCursorStyles = (): React.CSSProperties => {
    const { edgePx, marginPx } = this.props.letterSize
    return {
      width: '2px',
      height: `${edgePx + 2 * marginPx}px`,
      backgroundColor: 'black',
      position: 'relative',
      left: '-1px'
    }
  }

  render() {
    return (
      <div ref={this.wrapperRef} style={this.getWrapperStyles()}>
        <div style={this.getCursorStyles()} />
      </div>
    )
  }
}
