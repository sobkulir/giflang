import * as React from 'react'
import { LetterRow, LetterSize, SignToGifMap, Text } from '~/frontend/types/editor'
import * as styles from './text-area.scss'

interface RowProps {
  letterRow: LetterRow
  letterSize: LetterSize
  signToGifMap: SignToGifMap
}

interface ContentProps {
  text: Text
  letterSize: LetterSize
  signToGifMap: SignToGifMap
}

const Row: React.SFC<RowProps> = React.memo((props) => {
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
})

export const Content: React.SFC<ContentProps> = React.memo((props) => {
  const rows = props.text.map((letterRow) =>
    <Row
      key={letterRow.id}
      letterSize={props.letterSize}
      letterRow={letterRow}
      signToGifMap={props.signToGifMap}
    />)
  return (
    <div>
      {rows}
    </div>
  )
})
