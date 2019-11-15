import * as React from 'react'
import { LetterRow, LetterSize, SignToGifMap, Text } from '../../redux/editor/types'
import * as styles from './text-area.scss'

interface RowProps {
  letterRow: LetterRow
  letterSize: LetterSize
  signToGifMap: SignToGifMap
}

interface TextProps {
  text: Text
  letterSize: LetterSize
  signToGifMap: SignToGifMap
}

const Row: React.SFC<RowProps> = (props) => {
  const getLetterStyles = () => ({
    width: `${props.letterSize.edgePx}px`,
    height: `${props.letterSize.edgePx}px`,
    padding: `${props.letterSize.marginPx}px`,
  })

  const getRowStyles = () => ({
    height: `${props.letterSize.edgePx + 2 * props.letterSize.marginPx}px`
  })

  const row = props.letterRow.letters.map((letter) =>
    <img
      key={letter.id}
      style={getLetterStyles()}
      src={`${props.signToGifMap.get(letter.sign)}`}
    />)

  return (
    <div className={styles.letterRow} style={getRowStyles()}>
      {row}
    </div>
  )
}

export class Content extends React.Component<TextProps, {}> {
  render() {
    const rows = this.props.text.map((letterRow) =>
      <Row
        key={letterRow.id}
        letterSize={this.props.letterSize}
        letterRow={letterRow}
        signToGifMap={this.props.signToGifMap}
      />)

    return (
      <div>
        {rows}
      </div>
    )
  }
}
