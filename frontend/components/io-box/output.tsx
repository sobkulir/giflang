import * as React from 'react'
import { LetterSize, SignToGifMap } from '~/frontend/types/ide'
import { Text } from '~/frontend/types/text-area'
import { Content } from '../text-area/content'
import * as styles from './output.scss'

interface OutputProps {
  output: Text
  letterSize: LetterSize
  signToGifMap: SignToGifMap
  errorMsg: string
}

export const Output: React.SFC<OutputProps> = (props) =>
  (
    <div className={styles.outputWrapper}>
      <Content
        letterSize={props.letterSize}
        text={props.output}
        signToGifMap={props.signToGifMap}
      />
      <div className={styles.errorMsg}>
        {props.errorMsg}
      </div>
    </div>
  )

