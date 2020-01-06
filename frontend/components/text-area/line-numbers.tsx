import Typography from '@material-ui/core/Typography'
import React from 'react'
import { LetterSize } from '~/frontend/types/ide'

interface LineNumbersProps {
  textRowCount: number
  letterSize: LetterSize
}

interface LinenoProps {
  lineno: number
  letterSize: LetterSize
  width: number
}

const Lineno: React.SFC<LinenoProps> = React.memo((props) => {
  const getStyles = (): React.CSSProperties => {
    const boxSize = 2 * props.letterSize.marginPx + props.letterSize.edgePx
    const top = props.lineno * boxSize + boxSize / 2 - 10
    return {
      position: 'absolute',
      top: `${top}px`,
      width: `${props.width}`,
      boxSizing: 'border-box',
      paddingRight: '10px',
      textAlign: 'right',
    }
  }

  return (
    <div style={getStyles()}>
      <Typography variant="subtitle2" >
        {props.lineno + 1}
      </Typography>
    </div>
  )
})

export class LineNumbers extends React.PureComponent<LineNumbersProps>  {
  readonly width: number = 40

  getStyles = (): React.CSSProperties => {
    const boxSize =
      2 * this.props.letterSize.marginPx + this.props.letterSize.edgePx
    const height = this.props.textRowCount * boxSize
    return {
      position: 'relative',
      width: `${this.width}px`,
      height: `${height}px`
    }
  }

  render() {
    const lineRange = [...Array(this.props.textRowCount).keys()]
    const linenos = lineRange.map((lineno) => (
      <Lineno
        key={lineno}
        lineno={lineno}
        letterSize={this.props.letterSize}
        width={this.width}
      />))
    return (
      <div style={this.getStyles()}>
        {linenos}
      </div >
    )
  }
}
