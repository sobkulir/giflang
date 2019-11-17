import * as React from 'react'
import { LetterSize, SignToGifMap, Text } from '~/frontend/types/editor'
import { Content } from '../text-area/content'
import * as styles from './output.scss'

interface OutputProps {
  output: Text
  letterSize: LetterSize
  signToGifMap: SignToGifMap
}

export const Output: React.SFC<OutputProps> = (props) =>
  (
    <div className={styles.outputWrapper}>
      <Content
        letterSize={props.letterSize}
        text={props.output}
        signToGifMap={props.signToGifMap}
      />
    </div>
  )

