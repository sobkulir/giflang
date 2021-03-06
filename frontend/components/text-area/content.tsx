import * as React from 'react'
import { LetterSize, SignToGifMap } from '~/frontend/types/ide'
import { LetterRow, Text } from '~/frontend/types/text-area'

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

  const getRowStyles = (): React.CSSProperties => ({
    height: `${props.letterSize.edgePx + 2 * props.letterSize.marginPx}px`,
    /* Prevents images from wrapping */
    whiteSpace: 'nowrap'
  })

  const row = props.letterRow.letters.map((letter) =>
    <img
      key={letter.id}
      style={getLetterStyles()}
      src={`${props.signToGifMap.get(letter.sign)}`}
    />)

  return (
    <div style={getRowStyles()}>
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
