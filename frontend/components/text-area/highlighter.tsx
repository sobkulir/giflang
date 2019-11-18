import React from 'react'
import { RunState } from '~/frontend/types/execution'
import { LetterSize } from '~/frontend/types/ide'

interface HighlighterProps {
  letterSize: LetterSize
  runState: RunState
  lineno: number
}

export const Highlighter: React.SFC<HighlighterProps> = (props) => {
  const getStyles = (): React.CSSProperties => {
    const boxSize =
      2 * props.letterSize.marginPx + props.letterSize.edgePx
    const isVisible = props.runState === RunState.DEBUG_RUNNING
      || props.runState === RunState.DEBUG_WAITING
    return {
      display: `${(isVisible) ? 'block' : 'none'}`,
      position: 'absolute',
      left: '-10px',
      top: `${props.lineno * boxSize - boxSize / 2}`
    }
  }

  return (
    <div style={getStyles()}>
      >
  </div>
  )
}
